// Templates PDF : une seule colonne, texte extractible, ordre de lecture linéaire
// (compatibles ATS). Chaque template impose sa police et sa couleur par défaut,
// que l'utilisateur peut ensuite modifier dans l'onglet Design.
export const CV_TEMPLATES = [
  {
    id: 'ats',
    label: 'Ingénieur',
    description: 'Serif net, titres soulignés, photo à droite : style LaTeX, idéal stage PFE',
    defaultFont: 'Source Serif 4',
    defaultColor: '#15616d',
  },
  {
    id: 'classic',
    label: 'Académique',
    description: 'Photo à gauche, nom en couleur, entrées très structurées',
    defaultFont: 'Source Serif 4',
    defaultColor: '#1565c0',
  },
  {
    id: 'modern',
    label: 'Moderne',
    description: 'Sans-serif, titres en capitales, coordonnées étiquetées',
    defaultFont: 'Inter',
    defaultColor: '#0d3b66',
  },
  {
    id: 'minimal',
    label: 'Minimaliste',
    description: 'Noir et blanc, centré, sans photo : compatibilité ATS maximale',
    defaultFont: 'Carlito',
    defaultColor: '#111111',
  },
];

export const SKILL_LEVELS = [
  { value: 1, label: 'Débutant' },
  { value: 2, label: 'Élémentaire' },
  { value: 3, label: 'Intermédiaire' },
  { value: 4, label: 'Avancé' },
  { value: 5, label: 'Expert' },
];

export const LANGUAGE_LEVELS = [
  'Langue maternelle',
  'Bilingue',
  'Courant (C1/C2)',
  'Intermédiaire (B1/B2)',
  'Débutant (A1/A2)',
];

export const COLOR_PRESETS = [
  { name: 'Pétrole',         primary: '#15616d', secondary: '#4f9da6' },
  { name: 'Bleu académique', primary: '#1565c0', secondary: '#64b5f6' },
  { name: 'Marine',          primary: '#0d3b66', secondary: '#5c7fa3' },
  { name: 'Indigo profond',  primary: '#1a237e', secondary: '#7986cb' },
  { name: 'Bordeaux',        primary: '#7b1e3a', secondary: '#c06c84' },
  { name: 'Forêt',           primary: '#1b5e20', secondary: '#66bb6a' },
  { name: 'Anthracite',      primary: '#263238', secondary: '#78909c' },
  { name: 'Noir',            primary: '#111111', secondary: '#757575' },
];

// Polices embarquées dans le PDF (cf. src/components/pdf/pdfFonts.js).
export const FONT_OPTIONS = [
  { value: 'Source Serif 4', label: 'Source Serif 4 (serif, style LaTeX)' },
  { value: 'Inter',          label: 'Inter (sans-serif, moderne)' },
  { value: 'Carlito',        label: 'Carlito (équivalent Calibri)' },
  { value: 'Lato',           label: 'Lato (sans-serif, humaniste)' },
  { value: 'Roboto',         label: 'Roboto (sans-serif, neutre)' },
];

export const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal',  label: 'Normal' },
  { value: 'airy',    label: 'Aéré' },
];

export const DATE_STYLES = [
  { value: 'long',    label: 'Juillet 2026' },
  { value: 'short',   label: 'Juil. 2026' },
  { value: 'numeric', label: '07/2026' },
];

// Ordre des sections du CV (réordonnable par l'utilisateur dans l'onglet Design).
export const DEFAULT_SECTION_ORDER = [
  'summary', 'education', 'experiences', 'projects', 'achievements',
  'skills', 'certifications', 'distinctions', 'languages', 'interests',
];

// Libellés de l'éditeur.
export const SECTION_LABELS = {
  summary:        'Profil',
  experiences:    'Expériences',
  education:      'Formation',
  skills:         'Compétences',
  languages:      'Langues',
  projects:       'Projets',
  certifications: 'Certifications',
  achievements:   'Compétitions & palmarès',
  distinctions:   'Distinctions & publications',
  interests:      "Centres d'intérêt",
};

// Titres imprimés dans le PDF : intitulés standards, reconnus par les ATS.
// L'utilisateur peut les renommer (meta.sectionTitles).
export const DEFAULT_SECTION_TITLES = {
  summary:        'Profil professionnel',
  experiences:    'Expérience professionnelle',
  education:      'Formation',
  skills:         'Compétences techniques',
  languages:      'Langues',
  projects:       'Projets',
  certifications: 'Certifications',
  achievements:   'Compétitions et algorithmique',
  distinctions:   'Distinctions et publications',
  interests:      "Centres d'intérêt",
};

export const DEFAULT_META = {
  template:       'ats',
  colorScheme:    { primary: '#15616d', secondary: '#4f9da6' },
  fontFamily:     'Source Serif 4',
  sectionOrder:   [...DEFAULT_SECTION_ORDER],
  sectionTitles:  {},
  hiddenSections: [],
  density:        'normal',
  fontScale:      1,
  dateStyle:      'long',
  showPhoto:      true,
  showIcons:      true,
  autoFit:        true,
};

const initialCVData = {
  meta: { ...DEFAULT_META, sectionOrder: [...DEFAULT_SECTION_ORDER] },
  personalInfo: {
    firstName:    '',
    lastName:     '',
    title:        '',
    availability: '',
    email:        '',
    phone:        '',
    location:     '',
    website:      '',
    linkedin:     '',
    github:       '',
    photo:        '',
    summary:      '',
  },
  experiences:    [],
  education:      [],
  skills:         [],
  languages:      [],
  projects:       [],
  certifications: [],
  interests:      [],
  achievements:   [],
  distinctions:   [],
};

// Modèles d'items vides (éditeur, IA, migration).
export const EMPTY_ITEMS = {
  experiences:    { company: '', position: '', startDate: '', endDate: '', current: false, location: '', description: '', technologies: '' },
  education:      { school: '', degree: '', field: '', location: '', startDate: '', endDate: '', description: '' },
  skills:         { name: '', level: 3, category: '' },
  languages:      { name: '', level: 'Courant (C1/C2)' },
  projects:       { name: '', description: '', url: '', technologies: '', startDate: '', endDate: '' },
  certifications: { name: '', issuer: '', date: '', expiryDate: '', credentialId: '', url: '' },
  interests:      { name: '', category: 'Autre', description: '' },
  achievements:   { title: '', type: 'Compétition', rank: '', competition: '', date: '', location: '', description: '' },
  distinctions:   { title: '', type: 'Distinction', issuer: '', date: '', url: '', description: '' },
};

export const LIST_SECTIONS = Object.keys(EMPTY_ITEMS);

export const INTEREST_CATEGORIES = [
  'Sport',
  'Lecture',
  'Cinéma',
  'Musique',
  'Voyages',
  'Bénévolat',
  'Art',
  'Cuisine',
  'Technologie',
  'Autre',
];

export const ACHIEVEMENT_TYPES = [
  'Compétition',
  'Médaille',
  'Titre',
  'Record',
  'Sélection',
  'Distinction',
  'Autre',
];

export const DISTINCTION_TYPES = [
  'Distinction',
  'Prix',
  'Publication',
  'Conférence',
  'Brevet',
  'Autre',
];

export default initialCVData;
