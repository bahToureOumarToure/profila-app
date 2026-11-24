// Normalise n'importe quel CV (localStorage, JSON importé, sortie IA) vers la
// forme courante : champs ajoutés au fil des versions, ids manquants, anciennes
// valeurs (police Playfair, template inconnu…). Ne lève jamais d'exception.
import { v4 as uuidv4 } from 'uuid';
import initialCVData, {
  CV_TEMPLATES, DEFAULT_META, DEFAULT_SECTION_ORDER, EMPTY_ITEMS, FONT_OPTIONS,
  LIST_SECTIONS, DENSITY_OPTIONS, DATE_STYLES, PROJECT_TYPES, TECH_LABELS,
} from './initialCVData';
import { normalizeLanguage } from '@utils/languageLevel';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const FONT_ALIASES = { 'Playfair Display': 'Source Serif 4' };

function migrateMeta(meta) {
  const m = isObj(meta) ? meta : {};
  const template = CV_TEMPLATES.some((t) => t.id === m.template) ? m.template : DEFAULT_META.template;
  const rawFont = FONT_ALIASES[m.fontFamily] || m.fontFamily;
  const fontFamily = FONT_OPTIONS.some((f) => f.value === rawFont)
    ? rawFont
    : CV_TEMPLATES.find((t) => t.id === template).defaultFont;
  const scale = Number(m.fontScale);

  return {
    ...DEFAULT_META,
    ...m,
    template,
    fontFamily,
    colorScheme: isObj(m.colorScheme) && m.colorScheme.primary
      ? { secondary: m.colorScheme.primary, ...m.colorScheme }
      : { ...DEFAULT_META.colorScheme },
    sectionOrder: Array.isArray(m.sectionOrder) ? m.sectionOrder : [...DEFAULT_SECTION_ORDER],
    sectionTitles: isObj(m.sectionTitles) ? m.sectionTitles : {},
    hiddenSections: Array.isArray(m.hiddenSections) ? m.hiddenSections.filter((k) => typeof k === 'string') : [],
    density: DENSITY_OPTIONS.some((d) => d.value === m.density) ? m.density : 'normal',
    dateStyle: DATE_STYLES.some((d) => d.value === m.dateStyle) ? m.dateStyle : 'long',
    techLabel: TECH_LABELS.includes(m.techLabel) ? m.techLabel : '',
    fontScale: Number.isFinite(scale) ? Math.min(1.15, Math.max(0.8, scale)) : 1,
    showPhoto: m.showPhoto !== false,
    showIcons: m.showIcons !== false,
    highlightTitle: m.highlightTitle !== false,
    colorKeywords: m.colorKeywords === true,
    autoFit: m.autoFit !== false,
  };
}

// Conversions propres à certaines sections (anciens formats de données).
const UPGRADE = {
  // « level: 'Courant (C1/C2)' » → plage CECRL structurée.
  languages: (item) => normalizeLanguage(item),
  // Les projets sans type (avant la distinction) sont considérés académiques.
  projects: (item) => ({ ...item, type: PROJECT_TYPES.includes(item.type) ? item.type : 'Académique' }),
};

function migrateItems(section, items) {
  if (!Array.isArray(items)) return [];
  const upgrade = UPGRADE[section] || ((item) => item);
  return items
    .filter(isObj)
    .map((item) => ({
      ...EMPTY_ITEMS[section],
      ...upgrade(item),
      id: typeof item.id === 'string' && item.id ? item.id : uuidv4(),
    }));
}

export function migrateCV(data) {
  const d = isObj(data) ? data : {};
  const out = {
    ...initialCVData,
    meta: migrateMeta(d.meta),
    personalInfo: { ...initialCVData.personalInfo, ...(isObj(d.personalInfo) ? d.personalInfo : {}) },
  };
  LIST_SECTIONS.forEach((section) => { out[section] = migrateItems(section, d[section]); });

  // Les champs texte attendus par les inputs contrôlés ne doivent jamais être null.
  Object.keys(out.personalInfo).forEach((k) => {
    if (out.personalInfo[k] == null) out.personalInfo[k] = '';
  });
  return out;
}

export default migrateCV;
