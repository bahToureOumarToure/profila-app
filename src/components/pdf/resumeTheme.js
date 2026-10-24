// Paramètres visuels des templates PDF. Les 4 templates partagent le même
// moteur (ResumeDocument) : une colonne, ordre de lecture linéaire, texte réel.
import { FONT_BODY_SIZE } from './pdfFonts';

export const TEMPLATE_PRESETS = {
  // Inspiré du CV LaTeX « Élève-ingénieur » : nom à gauche, photo à droite,
  // titres colorés soulignés, organisme coloré + lieu / poste italique + dates.
  ats: {
    header: 'left',
    photo: { size: 64, radius: 3 },
    nameSize: 22,
    nameColor: 'text',
    headlineSep: '   |   ',
    contacts: 'icons',
    heading: { size: 1.18, weight: 700, upper: false, spacing: 0, rule: 0.7 },
    entry: 'org-first',
    tech: 'bullet',
    techLabel: 'Stack technique',
    summaryAlign: 'justify',
  },
  // Inspiré du CV « Futur ingénieur en IA » : photo ronde à gauche, nom en couleur,
  // coordonnées centrées, organisme + dates en gras, outils en italique.
  classic: {
    header: 'photo-left',
    photo: { size: 74, radius: 37 },
    nameSize: 25,
    nameColor: 'primary',
    nameWeight: 400,
    headlineSep: ', ',
    contacts: 'icons-center',
    heading: { size: 1.25, weight: 400, upper: false, spacing: 0, rule: 0.8 },
    entry: 'org-date',
    tech: 'line',
    techLabel: 'Outils',
    summaryAlign: 'justify',
  },
  // Inspiré du CV « Stage PFE test & automatisation » : sans-serif, titres en
  // capitales, coordonnées étiquetées (Téléphone :, Email :…).
  modern: {
    header: 'photo-left-labeled',
    photo: { size: 70, radius: 2 },
    nameSize: 21,
    nameColor: 'primary',
    headlineSep: ' — ',
    headlineUpper: true,
    contacts: 'labels',
    heading: { size: 1.12, weight: 700, upper: true, spacing: 0.5, rule: 1.1 },
    entry: 'org-location-date',
    tech: 'bullet',
    techLabel: 'Outils',
    summaryAlign: 'justify',
  },
  // Format « Jake's resume » : centré, noir et blanc, poste en premier, sans photo.
  minimal: {
    header: 'center',
    photo: null,
    nameSize: 22,
    nameColor: 'text',
    headlineSep: '  |  ',
    contacts: 'pipes',
    heading: { size: 1.08, weight: 700, upper: true, spacing: 0.9, rule: 0.6 },
    entry: 'role-first',
    tech: 'line',
    techLabel: 'Technologies',
    summaryAlign: 'left',
  },
};

// Interlignes serrés façon LaTeX (≈ 1,2) : le texte reste lisible sans gaspiller d'espace.
const DENSITY = {
  compact: { space: 0.68, lineHeight: 1.16 },
  normal:  { space: 1, lineHeight: 1.22 },
  airy:    { space: 1.3, lineHeight: 1.32 },
};

// Paliers d'ajustement automatique sur une page : on resserre d'abord les
// espacements, puis légèrement la taille du texte (jamais sous ~88 %).
export const FIT_STEPS = [
  { font: 1,    space: 1,    lineHeight: 1 },
  { font: 0.98, space: 0.82, lineHeight: 0.98 },
  { font: 0.96, space: 0.68, lineHeight: 0.965 },
  { font: 0.93, space: 0.56, lineHeight: 0.95 },
  { font: 0.9,  space: 0.46, lineHeight: 0.94 },
  { font: 0.88, space: 0.4,  lineHeight: 0.93 },
];

export function buildTheme(meta = {}, fit = FIT_STEPS[0]) {
  const preset = TEMPLATE_PRESETS[meta.template] || TEMPLATE_PRESETS.ats;
  const family = FONT_BODY_SIZE[meta.fontFamily] ? meta.fontFamily : 'Source Serif 4';
  const density = DENSITY[meta.density] || DENSITY.normal;
  const userScale = Number(meta.fontScale) || 1;
  const scale = userScale * fit.font;
  const base = FONT_BODY_SIZE[family] * scale;

  return {
    preset,
    family,
    primary: meta.colorScheme?.primary || '#15616d',
    text: '#1d1d1f',
    muted: '#4b4f56',
    base,
    small: base * 0.93,
    lineHeight: density.lineHeight * fit.lineHeight,
    // Unité d'espacement vertical (pt) : densité × palier d'ajustement.
    sp: density.space * fit.space,
    scale,
    showIcons: meta.showIcons !== false,
    showPhoto: meta.showPhoto !== false && Boolean(preset.photo),
    dateStyle: meta.dateStyle || 'long',
  };
}
