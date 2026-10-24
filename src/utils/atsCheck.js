// Analyse ATS locale (sans IA, instantanée) : règles concrètes tirées des bonnes
// pratiques de recrutement tech et du fonctionnement des ATS. Chaque constat
// indique la section de l'éditeur où le corriger.
import { DEFAULT_SECTION_TITLES } from '@data/initialCVData';
import { parseDescription, stripInlineMarkup, isSectionHidden } from './cvHelpers';

const clean = (v) => (typeof v === 'string' ? v.trim() : '');
// Une date n'est exploitable que si l'année est complète (« 2025 » ou « 2025-06 »).
const hasDate = (v) => /^\d{4}(-\d{2})?$/.test(clean(v));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const CLICHES = ['passionné', 'passionnée', 'dynamique', 'motivé', 'motivée', 'polyvalent', 'polyvalente',
  'sérieux', 'sérieuse', 'à l’écoute', "à l'écoute", 'relever tous les défis', 'esprit d’équipe', "esprit d'équipe"];
const WEAK_STARTS = /^(participation|aide|responsable de|chargé de|en charge de|j'ai|je |travail sur|missions?\s*:)/i;
const HAS_NUMBER = /\d/;
// Mots attendus par les ATS dans les intitulés de sections clés.
const STANDARD_TITLE_WORDS = {
  experiences: /exp[ée]rience|parcours professionnel|emploi|stage/i,
  education: /formation|[ée]tudes|dipl[ôo]me|education|cursus/i,
  skills: /comp[ée]tence|skills|technique/i,
};

const W = { error: 12, warning: 5, info: 1 };

export function analyzeATS(cv, { pages } = {}) {
  const checks = [];
  const add = (level, tab, message, tip = '') => checks.push({ level, tab, message, tip });
  const p = cv.personalInfo || {};
  const meta = cv.meta || {};
  const exps = (cv.experiences || []).filter((e) => clean(e.company) || clean(e.position));
  const edus = (cv.education || []).filter((e) => clean(e.school) || clean(e.degree));
  const projects = (cv.projects || []).filter((pr) => clean(pr.name));
  const skills = (cv.skills || []).filter((s) => clean(s.name));

  // ── En-tête ────────────────────────────────────────────────────────────
  if (!clean(p.firstName) || !clean(p.lastName)) add('error', 'personal', 'Nom et prénom manquants.');
  if (!clean(p.title)) add('warning', 'personal', 'Ajoutez un titre professionnel ciblé.', 'Ex. « Élève-ingénieur en génie informatique ». Les ATS et recruteurs le lisent en premier.');
  if (!clean(p.email)) add('error', 'personal', 'Adresse e-mail manquante.');
  else if (!EMAIL_RE.test(clean(p.email))) add('error', 'personal', "L'adresse e-mail semble invalide.");
  if (!clean(p.phone)) add('warning', 'personal', 'Numéro de téléphone manquant.');
  if (!clean(p.location)) add('warning', 'personal', 'Indiquez votre ville et votre pays.', 'Les ATS filtrent souvent par localisation (« Casablanca, Maroc »).');
  if (!clean(p.availability)) add('info', 'personal', 'Précisez votre disponibilité.', 'Ex. « Stage PFE de 6 mois à partir de février 2027 ».');
  if (!clean(p.linkedin)) add('info', 'personal', 'Ajoutez votre profil LinkedIn.');
  if (!clean(p.github) && !clean(p.website)) add('info', 'personal', 'Ajoutez un lien GitHub ou portfolio pour montrer vos projets.');
  ['linkedin', 'github', 'website'].forEach((k) => {
    if (clean(p[k]) && !URL_RE.test(clean(p[k]))) add('warning', 'personal', `Le lien ${k === 'website' ? 'portfolio' : k} semble mal formé.`);
  });
  if (clean(p.photo) && meta.showPhoto !== false) {
    add('info', 'customization', 'Photo affichée : courante au Maroc et en France, déconseillée pour les candidatures anglo-saxonnes.');
  }

  // ── Profil ─────────────────────────────────────────────────────────────
  const summary = stripInlineMarkup(clean(p.summary));
  if (!summary) add('warning', 'personal', 'Rédigez un profil professionnel de 3 à 5 lignes.', 'Niveau d’études, spécialité, domaines techniques, réalisations clés, stage recherché et disponibilité.');
  else {
    if (summary.length < 180) add('warning', 'personal', 'Profil trop court (moins de 3 lignes).');
    if (summary.length > 650) add('warning', 'personal', 'Profil trop long (plus de 5 lignes) : condensez-le.');
    const found = CLICHES.filter((c) => summary.toLowerCase().includes(c));
    if (found.length) add('info', 'personal', `Formulations vagues dans le profil : ${found.join(', ')}.`, 'Remplacez-les par des faits : technologies, projets, résultats.');
  }

  // ── Expériences ────────────────────────────────────────────────────────
  if (!exps.length && !projects.length) add('error', 'experience', 'Ajoutez au moins une expérience ou un projet.');
  let bulletsTotal = 0;
  let bulletsWithNumbers = 0;
  exps.forEach((e) => {
    const name = clean(e.position) || clean(e.company);
    if (!clean(e.company)) add('warning', 'experience', `« ${name} » : entreprise manquante.`);
    if (!clean(e.position)) add('warning', 'experience', `« ${name} » : intitulé du poste manquant.`);
    if (!hasDate(e.startDate)) add('error', 'experience', `« ${name} » : dates manquantes ou incomplètes.`, 'Les ATS calculent la durée d’expérience à partir des dates.');
    else if (!e.current && !hasDate(e.endDate)) add('warning', 'experience', `« ${name} » : date de fin manquante (ou cochez « Poste actuel »).`);
    // Année seule : début = janvier, fin = décembre (« 2025-06 » → « 2025 » reste cohérent).
    const start = clean(e.startDate).length === 4 ? `${clean(e.startDate)}-01` : clean(e.startDate);
    const end = clean(e.endDate).length === 4 ? `${clean(e.endDate)}-12` : clean(e.endDate);
    if (hasDate(e.startDate) && hasDate(e.endDate) && !e.current && end < start) {
      add('error', 'experience', `« ${name} » : la date de fin précède la date de début.`);
    }
    const { paragraph, bullets } = parseDescription(e.description);
    if (!paragraph && !bullets.length) add('warning', 'experience', `« ${name} » : décrivez vos réalisations.`);
    else if (!bullets.length) add('info', 'experience', `« ${name} » : présentez les réalisations en puces (une par ligne).`);
    if (bullets.length > 5) add('info', 'experience', `« ${name} » : ${bullets.length} puces, gardez les 3 à 5 plus fortes.`);
    bullets.forEach((b) => {
      bulletsTotal += 1;
      if (HAS_NUMBER.test(b)) bulletsWithNumbers += 1;
      if (stripInlineMarkup(b).length > 230) add('info', 'experience', `« ${name} » : une puce dépasse 2 lignes.`, 'Visez 1 à 2 lignes par puce.');
      if (WEAK_STARTS.test(stripInlineMarkup(b))) add('info', 'experience', `« ${name} » : commencez les puces par un verbe d’action (Conçu, Développé, Automatisé…).`);
    });
  });
  if (bulletsTotal >= 3 && bulletsWithNumbers === 0) {
    add('info', 'experience', 'Aucun résultat chiffré dans vos expériences.', 'Ajoutez des chiffres réels : %, volumes, délais, nombre d’utilisateurs.');
  }

  // ── Formation ──────────────────────────────────────────────────────────
  if (!edus.length) add('error', 'education', 'Ajoutez votre formation.');
  edus.forEach((e) => {
    const name = clean(e.degree) || clean(e.school);
    if (!clean(e.school)) add('warning', 'education', `« ${name} » : établissement manquant.`);
    if (!clean(e.degree)) add('warning', 'education', `« ${name} » : intitulé du diplôme manquant.`);
    if (!hasDate(e.startDate) && !hasDate(e.endDate)) add('warning', 'education', `« ${name} » : dates manquantes.`);
    if (!clean(e.location)) add('info', 'education', `« ${name} » : ajoutez la ville et le pays.`);
  });

  // ── Projets ────────────────────────────────────────────────────────────
  projects.forEach((pr) => {
    if (!clean(pr.technologies)) add('info', 'projects', `Projet « ${clean(pr.name)} » : listez les technologies utilisées.`, 'Ce sont des mots-clés recherchés par les ATS.');
    if (!clean(pr.description)) add('info', 'projects', `Projet « ${clean(pr.name)} » : décrivez ce que vous avez réalisé.`);
  });

  // ── Compétences ────────────────────────────────────────────────────────
  if (skills.length < 6) add('warning', 'skills', 'Listez au moins 6 compétences techniques.');
  const cats = new Set(skills.map((s) => clean(s.category)).filter(Boolean));
  if (skills.length >= 8 && cats.size <= 1) add('info', 'skills', 'Regroupez vos compétences par catégorie (Langages, Backend, DevOps…).');
  const seen = new Set();
  skills.forEach((s) => {
    const k = clean(s.name).toLowerCase();
    if (seen.has(k)) add('warning', 'skills', `Compétence en double : « ${clean(s.name)} ».`);
    seen.add(k);
  });
  if (!(cv.languages || []).some((l) => clean(l.name))) add('warning', 'languages', 'Ajoutez vos langues et leur niveau.');

  // ── Mise en page ───────────────────────────────────────────────────────
  if (pages > 1) add('warning', 'customization', `Le CV fait ${pages} pages : visez une page pour un stage.`, 'Activez « Ajuster sur 1 page » ou demandez à l’assistant de condenser.');
  Object.entries(STANDARD_TITLE_WORDS).forEach(([key, re]) => {
    const custom = clean(meta.sectionTitles?.[key]);
    if (custom && !re.test(custom)) {
      add('warning', 'customization', `Titre « ${custom} » peu standard : les ATS cherchent « ${DEFAULT_SECTION_TITLES[key]} ».`);
    }
  });
  ['experiences', 'education', 'skills'].forEach((key) => {
    if (isSectionHidden(meta, key) && (cv[key] || []).length) add('warning', 'customization', `La section « ${DEFAULT_SECTION_TITLES[key]} » est masquée.`);
  });

  const penalty = checks.reduce((sum, c) => sum + W[c.level], 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const counts = { error: 0, warning: 0, info: 0 };
  checks.forEach((c) => { counts[c.level] += 1; });
  const order = { error: 0, warning: 1, info: 2 };
  checks.sort((a, b) => order[a.level] - order[b.level]);
  return { score, checks, counts };
}
