// CV d'exemple (personne fictive) : sert de démonstration dans l'éditeur
// (« Charger un exemple ») et de jeu de données pour les tests de rendu PDF.
import { DEFAULT_META, DEFAULT_SECTION_ORDER } from './initialCVData';

const sampleCV = {
  meta: { ...DEFAULT_META, sectionOrder: [...DEFAULT_SECTION_ORDER] },
  personalInfo: {
    firstName: 'Amine',
    lastName: 'Bennani',
    title: 'Élève-ingénieur en Génie Informatique',
    availability: 'Recherche de stage PFE – Février 2027',
    email: 'amine.bennani@example.com',
    phone: '+212 6 00 00 00 00',
    location: 'Casablanca, Maroc',
    website: 'https://amine-bennani.example.dev',
    linkedin: 'https://www.linkedin.com/in/amine-bennani-exemple',
    github: 'https://github.com/amine-bennani-exemple',
    photo: '',
    summary: "Élève-ingénieur en dernière année, orienté ingénierie logicielle, backend Java et architectures distribuées. Maîtrise des microservices, de la sécurité des API REST (OAuth2/OIDC, JWT) et de Docker. Compétiteur actif en algorithmique (LeetCode, ICPC, Codeforces). Recherche un stage PFE de 4 à 6 mois dès février 2027.",
  },
  education: [
    {
      id: 'edu-1', school: "École Nationale de l'Intelligence Artificielle et du Digital (ENIAD)",
      degree: "Diplôme d'ingénieur d'État en Génie Informatique", field: '', location: 'Berkane, Maroc',
      startDate: '2023', endDate: '2027', description: '',
    },
    {
      id: 'edu-2', school: 'Université Mohammed Premier – Faculté des Sciences',
      degree: 'DEUG en Sciences Mathématiques et Informatique (SMI)', field: '', location: 'Oujda, Maroc',
      startDate: '2021', endDate: '2023', description: '',
    },
  ],
  experiences: [
    {
      id: 'exp-1', company: 'NBS Consulting', position: 'Consultant technique Salesforce – Stage PFA',
      location: 'Casablanca, Maroc', startDate: '2025-06', endDate: '2025-08', current: false,
      description: "- Conception du modèle de données (Accounts, Contacts, Leads, Cases) et automatisation via **Salesforce Flows**.\n- Configuration des droits d'accès (RBAC) et des règles de partage via Experience Cloud ; personnalisation du portail.\n- Réduction de 30 % du temps de traitement des demandes grâce à 6 flux automatisés.",
      technologies: 'Salesforce, Flows, Experience Cloud, SOQL',
    },
    {
      id: 'exp-2', company: 'Centre de relation client', position: 'Conseiller en relation client',
      location: 'Maroc', startDate: '2024-07', endDate: '2024-09', current: false,
      description: '- Prise en charge et résolution des requêtes clients dans le respect des objectifs de qualité et des délais (SLA).\n- Diagnostic des anomalies, escalade structurée des incidents techniques et suivi via les outils CRM.',
      technologies: '',
    },
  ],
  projects: [
    {
      id: 'proj-1', name: 'WorkForceX – Gestion des collaborateurs',
      technologies: 'Java, Spring Boot, Spring Cloud, OAuth2/OIDC, Docker',
      startDate: '2025', endDate: '2026', url: 'https://github.com/amine-bennani-exemple/workforcex',
      description: "- Architecture microservices avec découverte de services et routage centralisé via **Spring Cloud**.\n- Sécurisation des API REST via Spring Security, OAuth2 et OpenID Connect avec tokens JWT sans état.\n- Conteneurisation des microservices avec **Docker** pour standardiser les déploiements.",
    },
    {
      id: 'proj-2', name: 'Application full-stack de gestion de posts',
      technologies: 'React.js, Spring Boot, Axios, REST API, Maven',
      startDate: '2025-03', endDate: '2025-04', url: '',
      description: "- Développement client-serveur avec pagination serveur, recherche en temps réel et formulaires modaux.\n- Gestion de l'état global via Context API et centralisation des requêtes HTTP et des erreurs avec Axios.",
    },
    {
      id: 'proj-3', name: 'Application de gestion hospitalière',
      technologies: 'Java 17, Spring Boot, Hibernate (JPA), Spring Security, MySQL',
      startDate: '2024-11', endDate: '2024-12', url: '',
      description: "- Gestion des dossiers patients, admissions et antécédents avec contrôle d'accès par rôles (RBAC).\n- Optimisation des requêtes avec Spring Data JPA, Hibernate et pagination des résultats.",
    },
  ],
  achievements: [
    { id: 'ach-1', title: 'ICPC Moroccan Collegiate Programming Contest (MCPC)', type: 'Compétition', rank: 'Mention honorable', competition: '', date: '2025-09', location: '', description: '' },
    { id: 'ach-2', title: 'Compétition de Problem Solving, Club GI', type: 'Compétition', rank: '4e place', competition: '', date: '2024-03', location: 'Oujda', description: '' },
  ],
  skills: [
    { id: 'sk-1', name: 'Java (17+)', level: 4, category: 'Langages' },
    { id: 'sk-2', name: 'C/C++', level: 4, category: 'Langages' },
    { id: 'sk-3', name: 'Python', level: 3, category: 'Langages' },
    { id: 'sk-4', name: 'JavaScript', level: 3, category: 'Langages' },
    { id: 'sk-5', name: 'SQL', level: 4, category: 'Langages' },
    { id: 'sk-6', name: 'Spring Boot', level: 4, category: 'Backend & Architecture' },
    { id: 'sk-7', name: 'Spring Cloud', level: 3, category: 'Backend & Architecture' },
    { id: 'sk-8', name: 'Spring Security', level: 3, category: 'Backend & Architecture' },
    { id: 'sk-9', name: 'Hibernate', level: 3, category: 'Backend & Architecture' },
    { id: 'sk-10', name: 'Microservices', level: 3, category: 'Backend & Architecture' },
    { id: 'sk-11', name: 'React.js', level: 3, category: 'Frontend' },
    { id: 'sk-12', name: 'HTML5', level: 4, category: 'Frontend' },
    { id: 'sk-13', name: 'CSS3', level: 3, category: 'Frontend' },
    { id: 'sk-14', name: 'OAuth2', level: 3, category: 'Sécurité & Modélisation' },
    { id: 'sk-15', name: 'JWT', level: 3, category: 'Sécurité & Modélisation' },
    { id: 'sk-16', name: 'UML', level: 3, category: 'Sécurité & Modélisation' },
    { id: 'sk-17', name: 'Scrum', level: 3, category: 'Sécurité & Modélisation' },
    { id: 'sk-18', name: 'Docker', level: 3, category: 'DevOps & Outils' },
    { id: 'sk-19', name: 'Git', level: 4, category: 'DevOps & Outils' },
    { id: 'sk-20', name: 'GitHub Actions', level: 3, category: 'DevOps & Outils' },
    { id: 'sk-21', name: 'Jenkins', level: 2, category: 'DevOps & Outils' },
    { id: 'sk-22', name: 'Maven', level: 3, category: 'DevOps & Outils' },
  ],
  certifications: [
    { id: 'cert-1', name: 'Java Intermediate', issuer: 'SoloLearn', date: '2024-01', expiryDate: '', credentialId: '', url: '' },
  ],
  distinctions: [],
  languages: [
    { id: 'lang-1', name: 'Arabe', level: 'Langue maternelle' },
    { id: 'lang-2', name: 'Français', level: 'Courant (C1/C2)' },
    { id: 'lang-3', name: 'Anglais', level: 'Courant (C1/C2)' },
  ],
  interests: [
    { id: 'int-1', name: "Jeux d'échecs", category: 'Sport', description: 'analyse positionnelle, calcul tactique' },
    { id: 'int-2', name: 'Natation', category: 'Sport', description: '' },
    { id: 'int-3', name: 'Veille technologique et projets open source', category: 'Technologie', description: '' },
  ],
};

export default sampleCV;
