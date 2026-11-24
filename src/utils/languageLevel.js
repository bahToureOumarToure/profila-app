// Niveaux de langue : échelle européenne (CECRL A1 → C2), éventuellement en plage
// (« A2/B1 » pour quelqu'un entre deux niveaux), ou « Langue maternelle » / « Bilingue ».
// Un qualificatif (débutant… courant) est déduit automatiquement et peut être remplacé.

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const NATIVE_LEVELS = ['Langue maternelle', 'Bilingue'];

// Qualificatifs proposés dans l'éditeur ('' = automatique, 'none' = aucun).
export const DESCRIPTOR_OPTIONS = [
  'débutant', 'élémentaire', 'pré-intermédiaire', 'intermédiaire', 'avancé',
  'courant', 'maîtrise', 'professionnel', 'technique (lecture)',
];

const SINGLE = { A1: 'débutant', A2: 'élémentaire', B1: 'intermédiaire', B2: 'avancé', C1: 'courant', C2: 'maîtrise' };
const BAND = { A: 'débutant', B: 'intermédiaire', C: 'courant' };

const clean = (v) => (typeof v === 'string' ? v.trim() : '');
const code = (v) => (CEFR_LEVELS.includes(clean(v).toUpperCase()) ? clean(v).toUpperCase() : '');

// Plage ordonnée [min, max] ; un seul niveau renseigné vaut pour les deux bornes.
export function cefrRange(min, max) {
  const a = code(min);
  const b = code(max);
  if (!a && !b) return ['', ''];
  if (!a || !b) return [a || b, a || b];
  return CEFR_LEVELS.indexOf(a) <= CEFR_LEVELS.indexOf(b) ? [a, b] : [b, a];
}

export function formatCefr(min, max) {
  const [a, b] = cefrRange(min, max);
  if (!a) return '';
  return a === b ? a : `${a}/${b}`;
}

export function cefrDescriptor(min, max) {
  const [a, b] = cefrRange(min, max);
  if (!a) return '';
  if (a === b) return SINGLE[a];
  if (a[0] === b[0]) return BAND[a[0]];
  if (a === 'A2' && b === 'B1') return 'pré-intermédiaire';
  if (a === 'B2' && b === 'C1') return 'avancé';
  return BAND[b[0]];
}

/**
 * Lit un niveau écrit librement (ancien format « Courant (C1/C2) », sortie d'IA,
 * « B2 », « bilingue »…) et le traduit en champs structurés.
 */
export function parseLanguageLevel(text) {
  const s = clean(text);
  if (!s) return { nativeLevel: '', cefrMin: '', cefrMax: '' };
  if (/maternelle|natif|native|mother/i.test(s)) return { nativeLevel: 'Langue maternelle', cefrMin: '', cefrMax: '' };
  if (/bilingue|bilingual/i.test(s)) return { nativeLevel: 'Bilingue', cefrMin: '', cefrMax: '' };
  const codes = (s.toUpperCase().match(/\b[ABC][12]\b/g) || []).filter((c) => CEFR_LEVELS.includes(c));
  if (codes.length) {
    const idx = codes.map((c) => CEFR_LEVELS.indexOf(c));
    return { nativeLevel: '', cefrMin: CEFR_LEVELS[Math.min(...idx)], cefrMax: CEFR_LEVELS[Math.max(...idx)] };
  }
  const word = s.toLowerCase();
  const byWord = [
    [/courant|fluent|avanc[ée]|advanced|professionnel/, ['C1', 'C2']],
    [/interm[ée]diaire|intermediate/, ['B1', 'B2']],
    [/d[ée]butant|notions|beginner|[ée]l[ée]mentaire|basic/, ['A1', 'A2']],
  ].find(([re]) => re.test(word));
  return byWord
    ? { nativeLevel: '', cefrMin: byWord[1][0], cefrMax: byWord[1][1] }
    : { nativeLevel: '', cefrMin: '', cefrMax: '' };
}

/** Normalise une langue (y compris un ancien item n'ayant que `level`). */
export function normalizeLanguage(lang = {}) {
  const hasNew = ['nativeLevel', 'cefrMin', 'cefrMax'].some((k) => clean(lang[k]));
  const parsed = hasNew
    ? { nativeLevel: clean(lang.nativeLevel), cefrMin: lang.cefrMin, cefrMax: lang.cefrMax }
    : parseLanguageLevel(lang.level);
  const nativeLevel = NATIVE_LEVELS.includes(parsed.nativeLevel) ? parsed.nativeLevel : '';
  const [cefrMin, cefrMax] = cefrRange(parsed.cefrMin, parsed.cefrMax);
  const { level, ...rest } = lang; // eslint-disable-line no-unused-vars
  return {
    ...rest,
    name: clean(lang.name),
    nativeLevel,
    cefrMin,
    cefrMax,
    label: clean(lang.label),
    note: clean(lang.note),
  };
}

/** Qualificatif affiché : remplacement de l'utilisateur, sinon automatique. */
export function languageDescriptor(lang) {
  if (lang.nativeLevel) return lang.nativeLevel.toLowerCase();
  const label = clean(lang.label);
  if (label === 'none') return '';
  return label || cefrDescriptor(lang.cefrMin, lang.cefrMax);
}

/** Niveau sans le nom : « pré-intermédiaire – A2/B1, bonne compréhension écrite ». */
export function formatLanguageLevel(lang) {
  const descriptor = languageDescriptor(lang);
  const cefr = lang.nativeLevel ? '' : formatCefr(lang.cefrMin, lang.cefrMax);
  const level = [descriptor, cefr].filter(Boolean).join(' – ');
  return [level, clean(lang.note)].filter(Boolean).join(', ');
}

export function hasLanguageLevel(lang) {
  return Boolean(lang.nativeLevel || formatCefr(lang.cefrMin, lang.cefrMax));
}
