export const CV_TEMPLATES = [
  { id: 'modern',   label: 'Moderne',      description: 'Coloré, sidebar latérale, design contemporain' },
  { id: 'classic',  label: 'Classique',    description: 'Élégant, sobre, idéal pour les secteurs traditionnels' },
  { id: 'minimal',  label: 'Minimaliste',  description: 'Épuré, typographique, très lisible' },
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
  { name: 'Indigo profond',  primary: '#1a237e', secondary: '#7986cb' },
  { name: 'Ardoise bleue',   primary: '#0d47a1', secondary: '#42a5f5' },
  { name: 'Teal moderne',    primary: '#004d40', secondary: '#26a69a' },
  { name: 'Bordeaux',        primary: '#4a148c', secondary: '#ab47bc' },
  { name: 'Anthracite',      primary: '#212121', secondary: '#757575' },
  { name: 'Forêt',           primary: '#1b5e20', secondary: '#66bb6a' },
];

export const FONT_OPTIONS = [
  { value: 'Inter',             label: 'Inter (Moderne)' },
  { value: 'Roboto',            label: 'Roboto (Neutre)' },
  { value: 'Playfair Display',  label: 'Playfair Display (Élégant)' },
];

// Ordre des sections du CV (réordonnable par l'utilisateur dans l'onglet Design).
export const DEFAULT_SECTION_ORDER = [
  'summary', 'experiences', 'education', 'skills', 'languages',
  'projects', 'certifications', 'achievements', 'distinctions', 'interests',
];

export const SECTION_LABELS = {
  summary:        'Résumé / Profil',
  experiences:    'Expériences',
  education:      'Formation',
  skills:         'Compétences',
  languages:      'Langues',
  projects:       'Projets',
  certifications: 'Certifications',
  achievements:   'Palmarès',
  distinctions:   'Distinctions',
  interests:      "Centres d'intérêt",
};

const initialCVData = {
  meta: {
    template:     'modern',
    colorScheme:  { primary: '#1a237e', secondary: '#7986cb' },
    fontFamily:   'Inter',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  },
  personalInfo: {
    firstName:  '',
    lastName:   '',
    title:      '',
    email:      '',
    phone:      '',
    location:   '',
    website:    '',
    linkedin:   '',
    github:     '',
    photo:      '',
    summary:    '',
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
