// Assistant conversationnel : l'utilisateur dialogue avec l'IA sur SON CV.
// L'IA répond et PROPOSE des modifications structurées (actions) ; chaque action
// est validée ici contre le CV réel (ids, champs autorisés, formats) avant
// d'être montrée, puis appliquée seulement si l'utilisateur l'accepte.
import { v4 as uuid } from 'uuid';
import { generateJSON } from './geminiClient';
import { normDate, clampLevel, normLangLevel } from './cvSchema';
import {
  CV_TEMPLATES, DEFAULT_SECTION_ORDER, DENSITY_OPTIONS, DATE_STYLES, EMPTY_ITEMS,
  FONT_OPTIONS, LIST_SECTIONS, SECTION_LABELS,
} from '@data/initialCVData';
import { resolveSectionOrder, sectionTitle } from '@utils/cvHelpers';

export const EDITABLE_FIELDS = {
  personalInfo:   ['firstName', 'lastName', 'title', 'availability', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'summary'],
  experiences:    ['company', 'position', 'location', 'startDate', 'endDate', 'current', 'description', 'technologies'],
  education:      ['school', 'degree', 'field', 'location', 'startDate', 'endDate', 'description'],
  skills:         ['name', 'category', 'level'],
  languages:      ['name', 'level'],
  projects:       ['name', 'technologies', 'startDate', 'endDate', 'url', 'description'],
  certifications: ['name', 'issuer', 'date', 'expiryDate', 'credentialId', 'url'],
  interests:      ['name', 'category', 'description'],
  achievements:   ['title', 'type', 'rank', 'competition', 'date', 'location', 'description'],
  distinctions:   ['title', 'type', 'issuer', 'date', 'url', 'description'],
};

const DESIGN_FIELDS = ['template', 'density', 'fontScale', 'fontFamily', 'sectionOrder', 'hiddenSections', 'sectionTitles', 'autoFit', 'showPhoto', 'dateStyle'];

export const FIELD_LABELS = {
  firstName: 'Prénom', lastName: 'Nom', title: 'Titre', availability: 'Disponibilité', email: 'Email',
  phone: 'Téléphone', location: 'Lieu', website: 'Portfolio', linkedin: 'LinkedIn', github: 'GitHub',
  summary: 'Profil', company: 'Entreprise', position: 'Poste', startDate: 'Début', endDate: 'Fin',
  current: 'En cours', description: 'Description', technologies: 'Technologies', school: 'Établissement',
  degree: 'Diplôme', field: 'Spécialité', name: 'Nom', category: 'Catégorie', level: 'Niveau',
  url: 'Lien', issuer: 'Organisme', date: 'Date', expiryDate: 'Expiration', credentialId: 'Identifiant',
  type: 'Type', rank: 'Classement', competition: 'Compétition', template: 'Template', density: 'Densité',
  fontScale: 'Taille du texte', fontFamily: 'Police', sectionOrder: 'Ordre des sections',
  hiddenSections: 'Sections masquées', sectionTitles: 'Titres des sections', autoFit: 'Ajuster sur 1 page',
  showPhoto: 'Photo', dateStyle: 'Format des dates',
};

const DATE_FIELDS = new Set(['startDate', 'endDate', 'date', 'expiryDate']);
const MAIN_FIELD = {
  experiences: 'position', education: 'school', skills: 'name', languages: 'name', projects: 'name',
  certifications: 'name', interests: 'name', achievements: 'title', distinctions: 'title',
};

const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function sanitizeValue(section, field, value) {
  if (field === 'current') return value === true || value === 'true';
  if (DATE_FIELDS.has(field)) return normDate(value);
  if (section === 'skills' && field === 'level') return clampLevel(value);
  if (section === 'languages' && field === 'level') return normLangLevel(value);
  // Le modèle renvoie parfois une liste pour une description : on la met en puces.
  if (Array.isArray(value)) return value.map(str).filter(Boolean).map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n');
  return str(value);
}

function sanitizeFields(section, fields) {
  if (!isObj(fields)) return {};
  const out = {};
  EDITABLE_FIELDS[section].forEach((f) => {
    if (f in fields) out[f] = sanitizeValue(section, f, fields[f]);
  });
  return out;
}

function sanitizeDesign(fields, meta) {
  if (!isObj(fields)) return {};
  const out = {};
  const keys = DEFAULT_SECTION_ORDER;
  if (CV_TEMPLATES.some((t) => t.id === fields.template)) out.template = fields.template;
  if (DENSITY_OPTIONS.some((d) => d.value === fields.density)) out.density = fields.density;
  if (DATE_STYLES.some((d) => d.value === fields.dateStyle)) out.dateStyle = fields.dateStyle;
  if (FONT_OPTIONS.some((f) => f.value === fields.fontFamily)) out.fontFamily = fields.fontFamily;
  if (Number.isFinite(Number(fields.fontScale)) && fields.fontScale !== null && fields.fontScale !== '') {
    out.fontScale = Math.round(Math.min(1.1, Math.max(0.85, Number(fields.fontScale))) * 100) / 100;
  }
  if (Array.isArray(fields.sectionOrder)) {
    out.sectionOrder = resolveSectionOrder({ sectionOrder: fields.sectionOrder.filter((k) => keys.includes(k)) }, keys);
  }
  if (Array.isArray(fields.hiddenSections)) out.hiddenSections = [...new Set(fields.hiddenSections.filter((k) => keys.includes(k)))];
  if (isObj(fields.sectionTitles)) {
    const titles = { ...(meta.sectionTitles || {}) };
    Object.entries(fields.sectionTitles).forEach(([k, v]) => { if (keys.includes(k)) titles[k] = str(v); });
    out.sectionTitles = titles;
  }
  ['autoFit', 'showPhoto'].forEach((k) => { if (typeof fields[k] === 'boolean') out[k] = fields[k]; });
  return out;
}

const itemLabel = (section, item) => {
  if (!item) return '';
  const main = str(item[MAIN_FIELD[section]]) || str(item.name) || str(item.title);
  const sub = section === 'experiences' ? str(item.company) : section === 'education' ? str(item.degree) : '';
  return sub ? `${main} · ${sub}` : main;
};

const display = (field, v, meta) => {
  if (field === 'sectionOrder' || field === 'hiddenSections') {
    return (v || []).map((k) => sectionTitle(meta, k)).join(' → ') || '-';
  }
  if (field === 'sectionTitles') return Object.entries(v || {}).filter(([, t]) => t).map(([k, t]) => `${SECTION_LABELS[k]} : ${t}`).join(' ; ') || '-';
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  return v === '' || v == null ? '-' : String(v);
};

function changesFor(before, after, fields, meta) {
  return fields.map((f) => ({
    field: f, label: FIELD_LABELS[f] || f, before: display(f, before?.[f], meta), after: display(f, after[f], meta),
  }));
}

/**
 * Valide la sortie brute de l'IA contre le CV courant.
 * @returns {{ reply: string, actions: object[], suggestions: string[] }}
 */
export function normalizeAssistantResponse(raw, cv) {
  if (!isObj(raw)) throw new Error("Réponse de l'assistant illisible.");
  const meta = cv.meta || {};
  const actions = [];
  const find = (section, id) => (cv[section] || []).find((it) => it.id === id);

  (Array.isArray(raw.actions) ? raw.actions : []).forEach((a) => {
    if (!isObj(a)) return;
    const reason = str(a.reason);
    const section = str(a.section);
    const base = { key: uuid(), reason };

    switch (a.type) {
      case 'update_personal': {
        const fields = sanitizeFields('personalInfo', a.fields);
        const changed = Object.keys(fields).filter((f) => fields[f] !== (cv.personalInfo?.[f] ?? ''));
        if (!changed.length) return;
        const kept = Object.fromEntries(changed.map((f) => [f, fields[f]]));
        actions.push({ ...base, type: a.type, fields: kept, title: 'En-tête et profil', changes: changesFor(cv.personalInfo, kept, changed, meta) });
        return;
      }
      case 'update_item': {
        if (!LIST_SECTIONS.includes(section)) return;
        const item = find(section, a.id);
        if (!item) return;
        const fields = sanitizeFields(section, a.fields);
        const changed = Object.keys(fields).filter((f) => !same(fields[f], item[f] ?? ''));
        if (!changed.length) return;
        const kept = Object.fromEntries(changed.map((f) => [f, fields[f]]));
        actions.push({
          ...base, type: a.type, section, id: item.id, fields: kept,
          title: `${SECTION_LABELS[section]} : ${itemLabel(section, item) || 'élément'}`,
          changes: changesFor(item, kept, changed, meta),
        });
        return;
      }
      case 'add_item': {
        if (!LIST_SECTIONS.includes(section)) return;
        const fields = sanitizeFields(section, a.item);
        const item = { ...EMPTY_ITEMS[section], ...fields };
        if (!str(item[MAIN_FIELD[section]]) && !str(item.company)) return;
        if (section === 'skills' && (cv.skills || []).some((s) => str(s.name).toLowerCase() === str(item.name).toLowerCase())) return;
        const shown = Object.keys(fields).filter((f) => fields[f] !== '' && fields[f] !== false);
        actions.push({
          ...base, type: a.type, section, item,
          title: `Ajouter dans ${SECTION_LABELS[section]} : ${itemLabel(section, item)}`,
          changes: changesFor({}, item, shown, meta),
        });
        return;
      }
      case 'remove_item': {
        if (!LIST_SECTIONS.includes(section)) return;
        const item = find(section, a.id);
        if (!item) return;
        actions.push({
          ...base, type: a.type, section, id: item.id,
          title: `Supprimer de ${SECTION_LABELS[section]} : ${itemLabel(section, item)}`, changes: [],
        });
        return;
      }
      case 'reorder_items': {
        if (!LIST_SECTIONS.includes(section) || !Array.isArray(a.ids)) return;
        const list = cv[section] || [];
        const wanted = a.ids.filter((id, i) => list.some((it) => it.id === id) && a.ids.indexOf(id) === i);
        const ids = [...wanted, ...list.map((it) => it.id).filter((id) => !wanted.includes(id))];
        if (same(ids, list.map((it) => it.id))) return;
        const labels = (order) => order.map((id) => itemLabel(section, find(section, id))).join(' → ');
        actions.push({
          ...base, type: a.type, section, ids,
          title: `Réordonner : ${SECTION_LABELS[section]}`,
          changes: [{ field: 'order', label: 'Ordre', before: labels(list.map((it) => it.id)), after: labels(ids) }],
        });
        return;
      }
      case 'update_design': {
        const fields = sanitizeDesign(a.fields, meta);
        const current = { ...meta, sectionOrder: resolveSectionOrder(meta, DEFAULT_SECTION_ORDER) };
        const changed = Object.keys(fields).filter((f) => DESIGN_FIELDS.includes(f) && !same(fields[f], current[f]));
        if (!changed.length) return;
        const kept = Object.fromEntries(changed.map((f) => [f, fields[f]]));
        actions.push({ ...base, type: a.type, fields: kept, title: 'Mise en page', changes: changesFor(current, kept, changed, meta) });
        return;
      }
      default:
    }
  });

  const reply = str(raw.reply) || (actions.length ? 'Voici mes propositions :' : "Je n'ai pas de modification à proposer.");
  const suggestions = (Array.isArray(raw.suggestions) ? raw.suggestions : []).map(str).filter(Boolean).slice(0, 3);
  return { reply, actions, suggestions };
}

/** Applique des actions validées (fonction pure) et renvoie le nouveau CV. */
export function applyActionsToCV(cv, actions) {
  return actions.reduce((acc, a) => {
    switch (a.type) {
      case 'update_personal':
        return { ...acc, personalInfo: { ...acc.personalInfo, ...a.fields } };
      case 'update_item':
        return { ...acc, [a.section]: acc[a.section].map((it) => (it.id === a.id ? { ...it, ...a.fields } : it)) };
      case 'add_item':
        return { ...acc, [a.section]: [...acc[a.section], { id: uuid(), ...a.item }] };
      case 'remove_item':
        return { ...acc, [a.section]: acc[a.section].filter((it) => it.id !== a.id) };
      case 'reorder_items': {
        const byId = Object.fromEntries(acc[a.section].map((it) => [it.id, it]));
        const ordered = a.ids.map((id) => byId[id]).filter(Boolean);
        const rest = acc[a.section].filter((it) => !a.ids.includes(it.id));
        return { ...acc, [a.section]: [...ordered, ...rest] };
      }
      case 'update_design':
        return { ...acc, meta: { ...acc.meta, ...a.fields } };
      default:
        return acc;
    }
  }, cv);
}

// CV transmis à l'IA : ids conservés (pour cibler), photo exclue (lourde et inutile).
export function buildAssistantContext(cv, { pages } = {}) {
  const { photo, ...personalInfo } = cv.personalInfo || {};
  const meta = cv.meta || {};
  const ctx = {
    personalInfo: { ...personalInfo, hasPhoto: Boolean(photo) },
    design: {
      template: meta.template, density: meta.density, fontScale: meta.fontScale, fontFamily: meta.fontFamily,
      sectionOrder: resolveSectionOrder(meta, DEFAULT_SECTION_ORDER),
      hiddenSections: meta.hiddenSections || [], sectionTitles: meta.sectionTitles || {}, autoFit: meta.autoFit,
    },
  };
  if (pages) ctx.layout = { pages };
  LIST_SECTIONS.forEach((s) => {
    ctx[s] = (cv[s] || []).map((it) => Object.fromEntries(
      ['id', ...EDITABLE_FIELDS[s]].filter((f) => it[f] !== '' && it[f] != null).map((f) => [f, it[f]]),
    ));
  });
  return ctx;
}

export function buildAssistantSystemPrompt(cv, { jobText, pages } = {}) {
  const fields = Object.entries(EDITABLE_FIELDS).map(([s, f]) => `  ${s} : ${f.join(', ')}`).join('\n');
  const job = str(jobText);
  return `Tu es « Profila Coach », expert en rédaction de CV (recrutement informatique, stages PFE, systèmes ATS),
intégré à l'éditeur de CV Profila. Tu DIALOGUES avec l'utilisateur à propos de SON CV (fourni ci-dessous, état
actuel à jour) et tu peux PROPOSER des modifications ; l'utilisateur les accepte ou les refuse une par une.

RÈGLES
- Réponds en français, ton direct et concret. "reply" : 1 à 8 phrases ; listes avec "- " autorisées.
- N'invente JAMAIS d'expérience, de diplôme, de technologie, de chiffre ou de résultat absent du CV ou des
  messages de l'utilisateur. S'il manque une information (ex. un chiffre d'impact), DEMANDE-LA dans "reply".
- Propose des actions seulement si elles servent la demande ; pour une question simple, "actions": [].
- Expériences et projets ("description") : une réalisation par ligne commençant par "- ", verbe d'action en tête,
  1 à 2 lignes chacune, 2 à 4 puces par entrée, résultat chiffré quand il est connu ; 1 à 2 mots-clés techniques
  peuvent être mis en **gras**. "technologies" : liste séparée par des virgules.
- Profil ("summary") : 3 à 5 lignes (250 à 550 caractères) : niveau d'études et spécialité, domaines techniques,
  réalisations clés, type de stage et disponibilité. Pas de clichés (« passionné », « dynamique », « motivé »).
- ATS : intitulés de sections standards, une seule colonne, mots-clés de l'offre UNIQUEMENT s'ils correspondent au
  vécu réel, aucun bourrage de mots-clés. Un CV de stage PFE tient sur une page.
- Dates au format "YYYY-MM" ou "YYYY". Cible les éléments avec leur "id" exact. Ne renvoie que les champs modifiés.

FORMAT : renvoie UNIQUEMENT ce JSON (pas de Markdown autour) :
{
  "reply": "ta réponse",
  "actions": [
    { "type": "update_personal", "fields": { "summary": "..." }, "reason": "pourquoi, en une phrase" },
    { "type": "update_item", "section": "experiences", "id": "<id>", "fields": { "description": "- ...\\n- ..." }, "reason": "..." },
    { "type": "add_item", "section": "skills", "item": { "name": "Docker", "category": "DevOps & Outils" }, "reason": "..." },
    { "type": "remove_item", "section": "interests", "id": "<id>", "reason": "..." },
    { "type": "reorder_items", "section": "projects", "ids": ["<id>", "<id>"], "reason": "..." },
    { "type": "update_design", "fields": { "density": "compact" }, "reason": "..." }
  ],
  "suggestions": ["relance courte que l'utilisateur pourrait envoyer", "..."]
}
Champs modifiables par section :
${fields}
Design ("update_design") : template ∈ {ats, classic, modern, minimal} ; density ∈ {compact, normal, airy} ;
fontScale entre 0.85 et 1.1 ; sectionOrder et hiddenSections = clés parmi ${DEFAULT_SECTION_ORDER.join(', ')} ;
sectionTitles = { clé: "titre" } ; autoFit (booléen, ajuste le CV sur une page).
"suggestions" : 2 ou 3 relances utiles et courtes (moins de 70 caractères).
${pages ? `\nLe CV fait actuellement ${pages} page(s) une fois mis en page.` : ''}
${job ? `\nOFFRE CIBLÉE PAR L'UTILISATEUR :\n"""\n${job.slice(0, 6000)}\n"""\n` : ''}
CV ACTUEL (JSON) :
${JSON.stringify(buildAssistantContext(cv, { pages }))}`;
}

// Historique → tours Gemini. Les tours de l'assistant rappellent ce qui a été
// appliqué ou ignoré pour que l'IA en tienne compte dans la suite du dialogue.
export function toGeminiContents(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => (m.role === 'user'
      ? { role: 'user', parts: [{ text: m.text }] }
      : {
        role: 'model',
        parts: [{
          text: JSON.stringify({
            reply: m.text,
            actions: (m.actions || []).map((a) => ({ type: a.type, section: a.section, id: a.id, title: a.title, status: a.status || 'proposée' })),
          }),
        }],
      }));
}

export async function askAssistant({ cv, messages, jobText, pages, apiKey }) {
  const raw = await generateJSON({
    systemInstruction: buildAssistantSystemPrompt(cv, { jobText, pages }),
    contents: toGeminiContents(messages),
    temperature: 0.4,
    apiKey,
  });
  return normalizeAssistantResponse(raw, cv);
}
