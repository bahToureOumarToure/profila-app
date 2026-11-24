import { DEFAULT_SECTION_TITLES } from '@data/initialCVData';

const MONTHS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
  'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTHS_SHORT = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.',
  'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

export function formatMonthYear(dateString, style = 'long') {
  if (!dateString) return '';
  const [year, month] = String(dateString).split('-');
  if (!/^\d{4}$/.test(year || '')) return '';
  const m = Number(month);
  if (!m || m < 1 || m > 12) return year;
  if (style === 'numeric') return `${String(m).padStart(2, '0')}/${year}`;
  return `${(style === 'short' ? MONTHS_SHORT : MONTHS_LONG)[m - 1]} ${year}`;
}

export function formatDateRange(startDate, endDate, current, style = 'long') {
  const start = formatMonthYear(startDate, style);
  const end = current ? 'Présent' : formatMonthYear(endDate, style);
  if (!start) return end;
  if (!end || end === start) return start;
  return `${start} – ${end}`;
}

export function getInitials(firstName, lastName) {
  return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
}

// Ordre effectif des sections : la préférence utilisateur, complétée par les
// sections manquantes (ajoutées dans une version plus récente). Chacune est placée
// juste après la section qui la précède dans l'ordre par défaut.
export function resolveSectionOrder(meta, defaultOrder) {
  const saved = Array.isArray(meta?.sectionOrder) ? meta.sectionOrder : [];
  const order = saved.filter((k, i) => defaultOrder.includes(k) && saved.indexOf(k) === i);
  defaultOrder.forEach((key, i) => {
    if (order.includes(key)) return;
    const prev = defaultOrder.slice(0, i).reverse().find((k) => order.includes(k));
    order.splice(prev ? order.indexOf(prev) + 1 : 0, 0, key);
  });
  return order;
}

export function sectionTitle(meta, key) {
  const custom = meta?.sectionTitles?.[key];
  return (typeof custom === 'string' && custom.trim()) || DEFAULT_SECTION_TITLES[key] || key;
}

export function isSectionHidden(meta, key) {
  return Array.isArray(meta?.hiddenSections) && meta.hiddenSections.includes(key);
}

// Regroupe les compétences par catégorie (ordre d'apparition préservé).
export function groupSkillsByCategory(skills = []) {
  const groups = [];
  const index = {};
  skills.forEach((s) => {
    const name = (s.name || '').trim();
    if (!name) return;
    const cat = (s.category || '').trim() || 'Autres';
    if (!(cat in index)) { index[cat] = groups.length; groups.push({ cat, items: [] }); }
    groups[index[cat]].items.push(name);
  });
  return groups;
}

// Une description multi-lignes devient une liste à puces (une réalisation par
// ligne). Les marqueurs saisis à la main (-, *, •, ▪, 1.) sont retirés.
const BULLET_PREFIX = /^\s*(?:[-*•▪◦·–]|\d+[.)])\s+/;

export function parseDescription(text) {
  const raw = String(text || '').replace(/\r/g, '').trim();
  if (!raw) return { paragraph: '', bullets: [] };
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const hasMarkers = lines.some((l) => BULLET_PREFIX.test(l));
  if (lines.length === 1 && !hasMarkers) return { paragraph: lines[0], bullets: [] };

  // Une ligne d'introduction sans marqueur suivie de puces reste un paragraphe.
  if (hasMarkers && !BULLET_PREFIX.test(lines[0])) {
    return {
      paragraph: lines[0],
      bullets: lines.slice(1).map((l) => l.replace(BULLET_PREFIX, '').trim()).filter(Boolean),
    };
  }
  return { paragraph: '', bullets: lines.map((l) => l.replace(BULLET_PREFIX, '').trim()).filter(Boolean) };
}

// Mise en gras légère : **texte** → segment gras. Les étoiles orphelines restent du texte.
export function parseInlineBold(text) {
  const s = String(text || '');
  const parts = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = re.lastIndex;
  }
  if (last < s.length) parts.push({ text: s.slice(last), bold: false });
  return parts;
}

export const stripInlineMarkup = (text) => String(text || '').replace(/\*\*(.+?)\*\*/g, '$1');

const escapeRegExp = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Met en **gras** la première occurrence de chaque mot-clé (mots entiers, sans tenir
 * compte de la casse), sans toucher au texte déjà en gras. Les plus longs d'abord :
 * « Spring Boot » passe avant « Spring ».
 * @returns {{ text: string, added: string[] }}
 */
export function boldKeywords(text, keywords = []) {
  let parts = parseInlineBold(text);
  const added = [];
  const list = [...new Set(keywords.map((k) => String(k || '').replace(/\s*\(.*?\)\s*/g, ' ').trim()).filter((k) => k.length > 1))]
    .sort((a, b) => b.length - a.length);
  list.forEach((kw) => {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(kw)}(?![\\p{L}\\p{N}])`, 'iu');
    if (parts.some((p) => p.bold && p.text.toLowerCase() === kw.toLowerCase())) return;
    const idx = parts.findIndex((p) => !p.bold && re.test(p.text));
    if (idx === -1) return;
    const seg = parts[idx].text;
    const m = seg.match(re);
    parts = [
      ...parts.slice(0, idx),
      { text: seg.slice(0, m.index), bold: false },
      { text: m[0], bold: true },
      { text: seg.slice(m.index + m[0].length), bold: false },
      ...parts.slice(idx + 1),
    ].filter((p) => p.text);
    added.push(m[0]);
  });
  return { text: parts.map((p) => (p.bold ? `**${p.text}**` : p.text)).join(''), added };
}

/** Met en gras la sélection [start, end[ (ou retire le gras si elle l'est déjà). */
export function toggleBold(text, start, end) {
  const s = String(text || '');
  if (start == null || end == null || end <= start) return { text: s, start, end };
  const raw = s.slice(start, end);
  // Sélection déjà encadrée par ** (à l'extérieur ou incluse) : on retire le gras.
  if (s.slice(start - 2, start) === '**' && s.slice(end, end + 2) === '**') {
    return { text: s.slice(0, start - 2) + raw + s.slice(end + 2), start: start - 2, end: end - 2 };
  }
  if (/^\*\*.+\*\*$/s.test(raw)) {
    const inner = raw.slice(2, -2);
    return { text: s.slice(0, start) + inner + s.slice(end), start, end: start + inner.length };
  }
  // Les espaces sélectionnés aux bords restent hors du gras.
  const lead = raw.length - raw.trimStart().length;
  const trail = raw.length - raw.trimEnd().length;
  const core = raw.trim();
  if (!core) return { text: s, start, end };
  const a = start + lead;
  const b = end - trail;
  return { text: `${s.slice(0, a)}**${core}**${s.slice(b)}`, start: a, end: b + 4 };
}

// URL cliquable : ajoute https:// si l'utilisateur a saisi « github.com/moi ».
export function normalizeUrl(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  return `https://${v.replace(/^\/+/, '')}`;
}

// URL lisible imprimée sur le CV : sans protocole, sans www, sans / final.
export function prettyUrl(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

export function telHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
}

export function downloadJSON(data, filename = 'mon-cv.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(JSON.parse(e.target.result)); }
      catch { reject(new Error('Fichier JSON invalide')); }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
