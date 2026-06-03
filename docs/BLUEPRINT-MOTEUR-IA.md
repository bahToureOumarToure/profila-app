# Blueprint — Moteur IA de Profila

> Conception de la couche d'intelligence (parsing PDF, analyse de job description,
> audit de compatibilité, optimisation ATS) **par-dessus** l'application Profila
> existante (React 18 + Vite + MUI, 100 % client-side, privacy-first).

Ce document est rédigé en partant du code réel du dépôt, pas d'une feuille blanche.
Le modèle de données ci-dessous est celui que manipule déjà `CVContext` /
`initialCVData.js`. Toute sortie de l'IA doit s'y conformer.

---

## 0. Point de départ : ce qui existe déjà

| Brique | État actuel | Fichier |
|--------|-------------|---------|
| Modèle de données CV | ✅ Complet (11 sections) | `src/data/initialCVData.js` |
| État global + autosave | ✅ `useReducer` + localStorage | `src/context/CVContext.jsx` |
| Éditeur temps réel | ✅ 10 sections + drag & drop | `src/components/editor/` |
| 3 templates HTML | ✅ Modern / Classic / Minimal | `src/components/preview/templates/` |
| Export PDF natif A4 | ✅ `@react-pdf/renderer` | `src/components/pdf/` |
| Import / Export JSON | ✅ `downloadJSON` / `readJSONFile` | `src/utils/cvHelpers.js` |
| Score de complétion | ✅ heuristique 0-100 | `cvCompletionScore()` |
| **Parsing PDF (IA)** | ❌ à construire | — |
| **Analyse job description** | ❌ à construire | — |
| **Audit de compatibilité** | ❌ à construire | — |
| **Optimisation ATS** | ❌ à construire | — |

Le `loadCV(data)` du contexte (`LOAD_CV` → `{ ...initialCVData, ...payload }`)
est **le point d'injection idéal** : si l'IA produit un JSON valide, le pré-remplissage
du formulaire est déjà gratuit.

---

## 1. Analyse critique des défis techniques

### 1.1 Le défi central : IA ⇄ promesse "privacy-first"

C'est **LE** point d'architecture, pas un détail. Le README promet :

> « Aucun serveur, aucun tracking, aucun cookie. Toutes vos informations restent dans votre navigateur. »

Or tout appel à un LLM (OpenAI, Anthropic, Mistral, Gemini) implique :
- d'**exposer une clé API** — impossible côté client sans la divulguer ;
- d'**envoyer le contenu du CV** (données personnelles : nom, email, téléphone) à un tiers.

➡️ **Décision obligatoire avant toute ligne de code.** Trois options :

| Option | Privacy | Coût | Complexité |
|--------|---------|------|-----------|
| **A. Backend proxy léger** (Edge Function) qui détient la clé et relaie au LLM | Donnée transite mais clé protégée ; pas de stockage | $ par requête | moyenne |
| **B. BYOK** (Bring Your Own Key) : l'utilisateur colle sa propre clé, appel direct navigateur → LLM | Aucune donnée chez nous | $0 pour nous | faible |
| **C. Modèle local navigateur** (Transformers.js / WebLLM, parsing PDF via `pdfjs` + heuristiques) | 100 % local, fidèle à la promesse | $0, mais qualité ↓ et bundle ↑↑ | élevée |

Recommandation : **B (BYOK) en mode par défaut + A en option managée**, et conserver
explicitement un chemin « sans IA » (l'app reste pleinement utilisable). La page
*Politique de confidentialité* doit être mise à jour : l'IA devient un traitement
**opt-in** clairement annoncé.

### 1.2 Parsing PDF — le PDF est un format hostile

- Un PDF n'a **pas de structure sémantique** : c'est du texte positionné en (x, y).
  Les CV sur 2 colonnes cassent l'ordre de lecture naturel.
- Les CV « design » (Canva, InDesign) encodent souvent le texte en **vecteurs/images**
  → le texte n'est pas extractible, il faut de l'**OCR** (modèle de vision).
- Polices à glyphes custom → caractères mal mappés (ligatures, accents perdus).

➡️ Pipeline en deux temps : extraction texte (`pdf.js`) **puis**, si le ratio
texte/page est trop faible, **fallback vision** (rendu canvas → image → LLM multimodal).

### 1.3 Sortie LLM non déterministe → contrat strict obligatoire

Un LLM « bavarde ». Pour pré-remplir un formulaire il faut une sortie **machine-readable
garantie** :
- imposer un **JSON Schema** (function calling / structured outputs / `response_format`) ;
- **valider** côté client (Zod) avant `loadCV` — ne jamais faire confiance à la sortie ;
- gérer dates hétérogènes (« 2021 », « janv. 2021 », « 01/2021 ») → normaliser en `YYYY-MM`
  attendu par les champs `type="month"` de l'éditeur.

### 1.4 ATS — éviter le « keyword stuffing » et le mensonge

- Bourrer des mots-clés nuit (les ATS modernes et les recruteurs détectent le stuffing ;
  les techniques type texte blanc sont pénalisées).
- **Risque éthique** : injecter des compétences que le candidat n'a pas = inciter au mensonge.
  L'optimisation doit **reformuler / faire remonter** l'existant, jamais **inventer**.
- Le prompt doit donc distinguer : `matched` (déjà présent), `reformulate` (présent mais
  mal exprimé), `missing` (réellement absent → **proposé, pas inséré d'office**, avec
  un avertissement « à confirmer »).

### 1.5 Analyse de job description par URL — le mur du CORS / scraping

- `fetch()` direct d'une URL LinkedIn/Indeed depuis le navigateur = **bloqué par CORS**
  et souvent par anti-bot / authentification.
- Le scraping d'offres viole fréquemment les CGU des plateformes.

➡️ Privilégier le **collage de texte** (copier-coller de l'offre). Le mode « URL »
exige un backend récupérateur et reste *best-effort*. Ne pas le survendre.

### 1.6 Coût, latence, robustesse

- Latence LLM : 2-15 s → UX de **streaming** + états de chargement obligatoires
  (Framer Motion pour les transitions, skeleton loaders).
- Coût : un parsing = milliers de tokens → throttling, cache de résultat, et en BYOK
  c'est l'utilisateur qui paie (transparence sur le coût estimé).
- Pannes API / rate limits → dégradation gracieuse, retry exponentiel, message clair.

### 1.7 Dette technique à surveiller

- `react-beautiful-dnd` est **déprécié** (et incompatible React 18 StrictMode strict).
  Si on touche au DnD pendant ce chantier, migrer vers `@hello-pangea/dnd` (drop-in) ou `dnd-kit`.
- Les items sont identifiés par `id: uuidv4()` injecté **dans le reducer** (`ADD_ITEM`).
  Le JSON produit par l'IA **n'aura pas d'`id`** → il faut les générer au moment de
  l'hydratation, sinon clés React instables dans les listes drag & drop.

---

## 2. Guide étape par étape (parcours utilisateur)

Parcours « optimiser mon CV pour une offre » — pensé pour s'insérer dans `BuilderPage`.

1. **Point d'entrée** — bouton « ✨ Importer & Optimiser avec l'IA » sur la HomePage
   et dans la Navbar du Builder.
2. **Consentement IA** (1ʳᵉ fois) — modale expliquant que le contenu sera envoyé à un
   service d'IA ; choix du mode (clé personnelle BYOK ou service managé) ; case opt-in.
3. **Import du CV** — drag & drop d'un PDF (ou « partir d'une page blanche »).
   - Barre de progression : *Extraction → Analyse → Structuration*.
   - Aperçu du texte extrait + avertissement si fallback OCR utilisé.
4. **Validation du pré-remplissage** — l'IA renvoie le JSON ; l'éditeur est rempli.
   Chaque champ déduit par IA est **badgé** (« suggéré par IA ») et reste éditable.
   L'utilisateur corrige/valide section par section.
5. **Ajout de l'offre d'emploi** — onglet « Cibler une offre » : coller le texte de
   l'offre (ou URL en best-effort). L'IA extrait *keywords*, *hard/soft skills*, séniorité.
6. **Audit de compatibilité** — score 0-100 affiché en jauge animée, avec :
   - mots-clés **présents** (verts), **à reformuler** (orange), **manquants** (rouges) ;
   - recommandations priorisées.
7. **Optimisation ATS (opt-in, non destructive)** — vue **diff côte-à-côte**
   (avant / après) par section. L'utilisateur **accepte/refuse chaque suggestion**.
   Rien n'est appliqué sans clic. Les ajouts « missing » sont marqués « à confirmer ».
8. **Personnalisation visuelle** — template (Modern/Classic/Minimal), palette, police
   (Inter / Roboto / Playfair) — déjà existant.
9. **Export** — PDF A4 natif (existant) + sauvegarde JSON locale.
   Rappel : tout reste dans le navigateur sauf l'étape IA explicitement consentie.

Garde-fous UX transverses : aucune action IA n'écrase les données sans confirmation ;
un bouton « Annuler / revenir à ma version » est toujours présent (historique d'au moins
1 état avant optimisation).

---

## 3. Structure JSON utilisée par l'IA

L'IA doit produire **exactement** la forme attendue par `loadCV()` / `initialCVData`.
Contraintes :
- dates au format `"YYYY-MM"` (ou `"YYYY"`) — compat champs `type="month"` ;
- `skills[].level` ∈ `1..5` ; `languages[].level` parmi les libellés autorisés ;
- pas d'`id` (généré à l'hydratation) ;
- champs inconnus → chaîne vide, jamais `null`.

### 3.1 Schéma de CV (sortie du parsing / pré-remplissage)

```json
{
  "meta": {
    "template": "modern",
    "colorScheme": { "primary": "#1a237e", "secondary": "#7986cb" },
    "fontFamily": "Inter"
  },
  "personalInfo": {
    "firstName": "Awa",
    "lastName": "Diallo",
    "title": "Ingénieure Full-Stack",
    "email": "awa.diallo@example.com",
    "phone": "+33 6 12 34 56 78",
    "location": "Paris, France",
    "website": "https://awadiallo.dev",
    "linkedin": "https://www.linkedin.com/in/awadiallo",
    "github": "https://github.com/awadiallo",
    "photo": "",
    "summary": "Ingénieure full-stack (5 ans) spécialisée React/Node, orientée produit et performance."
  },
  "experiences": [
    {
      "company": "Fintech XYZ",
      "position": "Senior Frontend Engineer",
      "startDate": "2022-03",
      "endDate": "",
      "current": true,
      "location": "Paris",
      "description": "Refonte du parcours d'onboarding : +28 % de conversion, -40 % de temps de chargement (LCP 4.1s → 2.4s). Encadrement de 3 développeurs."
    }
  ],
  "education": [
    {
      "school": "Université Paris-Saclay",
      "degree": "Master Informatique",
      "field": "Génie logiciel",
      "startDate": "2016-09",
      "endDate": "2018-06",
      "description": "Mention Bien. Spécialisation systèmes distribués."
    }
  ],
  "skills": [
    { "name": "React", "level": 5, "category": "Frontend" },
    { "name": "TypeScript", "level": 4, "category": "Langages" },
    { "name": "Node.js", "level": 4, "category": "Backend" }
  ],
  "languages": [
    { "name": "Français", "level": "Langue maternelle" },
    { "name": "Anglais", "level": "Courant (C1/C2)" }
  ],
  "projects": [
    {
      "name": "Profila",
      "description": "Générateur de CV open-source, éditeur temps réel et export PDF. Rôle : lead front.",
      "url": "https://profila.bahoumartoure.com",
      "technologies": "React, Vite, MUI, @react-pdf/renderer"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer – Associate",
      "issuer": "Amazon Web Services",
      "date": "2023-05",
      "expiryDate": "2026-05",
      "credentialId": "ABC-123",
      "url": "https://www.credly.com/badges/xxxx"
    }
  ],
  "interests": [
    { "name": "Course à pied", "category": "Sport", "description": "Semi-marathon 2024" }
  ],
  "achievements": [
    { "title": "1er prix Hackathon Tech4Good", "type": "Compétition", "rank": "1/40 équipes",
      "competition": "Tech4Good 2023", "date": "2023-11", "location": "Lyon",
      "description": "Prototype d'accessibilité web primé." }
  ],
  "distinctions": [
    { "title": "Speaker — React Paris", "type": "Conférence", "issuer": "React Paris",
      "date": "2024-03", "url": "", "description": "Talk sur le rendu PDF côté client." }
  ]
}
```

### 3.2 Schéma d'analyse d'offre + audit (sortie de l'audit de compatibilité)

Objet **séparé** du CV (ne pollue pas `cvData` ; stocké à part, ex. `analysis`) :

```json
{
  "job": {
    "title": "Développeur Full-Stack React/Node",
    "company": "ACME",
    "seniority": "Confirmé (3-5 ans)",
    "hardSkills": ["React", "Node.js", "PostgreSQL", "AWS", "CI/CD", "TypeScript"],
    "softSkills": ["Communication", "Autonomie", "Esprit produit"],
    "keywords": ["microservices", "REST", "tests automatisés", "Agile/Scrum"]
  },
  "audit": {
    "score": 78,
    "breakdown": { "hardSkills": 82, "softSkills": 70, "keywords": 75, "seniority": 90 },
    "matched":   ["React", "Node.js", "TypeScript", "AWS"],
    "reformulate": [
      { "keyword": "tests automatisés",
        "found_in": "experiences[0].description",
        "suggestion": "Expliciter la couverture de tests (Jest/Playwright) et son impact." }
    ],
    "missing": [
      { "keyword": "PostgreSQL", "severity": "high",
        "advice": "Présent dans votre parcours ? Si oui, l'ajouter aux compétences. Sinon, ne pas inventer." }
    ],
    "recommendations": [
      "Quantifier 2 réalisations supplémentaires (chiffres/impact).",
      "Faire remonter 'CI/CD' dans le résumé professionnel."
    ]
  }
}
```

### 3.3 Schéma d'optimisation ATS (sortie non destructive, diff)

```json
{
  "optimizations": [
    {
      "section": "personalInfo.summary",
      "before": "Ingénieure full-stack passionnée par le web.",
      "after": "Ingénieure full-stack React/Node (5 ans), spécialisée performance et CI/CD, orientée produit.",
      "rationale": "Intègre 3 mots-clés de l'offre déjà vrais pour la candidate.",
      "kind": "reformulate",
      "confidence": 0.92
    }
  ]
}
```

`kind ∈ {reformulate, add, reorder}`. Toute entrée `add` correspondant à un `missing`
est marquée `"needsUserConfirmation": true`.

---

## 4. Stack technique recommandée

### 4.1 Conserver l'existant (il est sain)

React 18 + Vite 5, MUI 5 + Emotion, React Router 6, Context+`useReducer`,
`@react-pdf/renderer`, `react-helmet-async`. Aucune raison de réécrire le socle.

### 4.2 Ajouts pour le moteur IA

| Besoin | Choix recommandé | Pourquoi |
|--------|------------------|----------|
| Extraction texte PDF | `pdfjs-dist` | Déjà dans l'orbite Vite du projet ; 100 % client |
| Validation sortie LLM | **Zod** | Contrat strict, garde-fou avant `loadCV` |
| Appel LLM (structuré) | **Anthropic Claude** (`claude-sonnet-4-6` qualité / `claude-haiku-4-5` rapide) avec *structured outputs* + **prompt caching** | Sortie JSON fiable, multimodal pour l'OCR fallback, cache → coût ↓ |
| Backend proxy (option A) | **Vercel/Netlify Edge Function** ou Cloudflare Worker | Détient la clé, relaie, ne stocke rien ; streaming SSE |
| Animations / micro-UX | **Framer Motion** | Jauge de score, diffs, transitions de panneaux |
| État serveur / async | **TanStack Query** | Cache, retry exponentiel, états loading/error propres |
| Diff visuel ATS | `diff` (jsdiff) + rendu MUI | Avant/après lisible par section |
| 100 % local (option C) | `@xenova/transformers` (Transformers.js) / WebLLM | Si la promesse zéro-serveur prime sur la qualité |

### 4.3 Polices

Pour rester cohérent avec `FONT_OPTIONS` (Inter / Roboto / Playfair Display) et la
demande « sans-serif moderne » : **Inter** par défaut (déjà prévu), Geist en option
future. Charger via `@fontsource` (offline-friendly, pas de fuite vers Google Fonts —
cohérent avec la posture privacy).

### 4.4 Organisation du code proposée (greffe minimale, non invasive)

```
src/
├── ai/
│   ├── client.js          # adaptateur LLM (BYOK | proxy) — une seule interface
│   ├── schemas.js         # schémas Zod : CV, Job, Audit, Optimizations
│   ├── prompts.js         # prompts versionnés (parse / analyzeJob / audit / optimize)
│   ├── pdfExtract.js      # pdfjs → texte ; détection besoin OCR
│   └── hydrate.js         # JSON IA → injection uuid → loadCV()
├── context/
│   └── AnalysisContext.jsx  # état job + audit + optimisations (séparé de CVContext)
└── components/ai/
    ├── ImportWizard.jsx     # étapes 2-4 du guide
    ├── JobTargetPanel.jsx   # étape 5
    ├── MatchScore.jsx       # jauge animée (Framer Motion)
    └── AtsDiffReview.jsx    # diff accept/reject par suggestion
```

Principe directeur : **le moteur IA est une couche optionnelle**. `CVContext`,
les templates et l'export PDF ne changent pas ; l'IA ne fait que produire un JSON
conforme et le pousser via `loadCV`. L'app reste utilisable sans aucune IA.

---

## 5. Synthèse des décisions à trancher (avant le code)

1. **Mode IA** : BYOK seul, proxy managé seul, ou les deux ? (impacte privacy, coût, backend)
2. **URL d'offre** : on assume le best-effort + backend scraper, ou on se limite au collage de texte ?
3. **Migration DnD** : profite-t-on de ce chantier pour quitter `react-beautiful-dnd` (déprécié) ?
4. **Mise à jour légale** : la Politique de confidentialité doit refléter le traitement IA opt-in.
