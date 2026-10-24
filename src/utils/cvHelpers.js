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
// sections manquantes dans l'ordre par défaut (rétro-compatible avec d'anciens CV).
export function resolveSectionOrder(meta, defaultOrder) {
  const saved = Array.isArray(meta?.sectionOrder) ? meta.sectionOrder : [];
  const valid = saved.filter((k, i) => defaultOrder.includes(k) && saved.indexOf(k) === i);
  const missing = defaultOrder.filter((k) => !valid.includes(k));
  return [...valid, ...missing];
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

// « Courant (C1/C2) » → « courant, C1/C2 » pour l'affichage en ligne.
export function formatLanguageLevel(level) {
  const s = String(level || '').trim();
  if (!s) return '';
  const m = s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const base = m ? `${m[1]}, ${m[2]}` : s;
  return base.charAt(0).toLowerCase() + base.slice(1);
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
