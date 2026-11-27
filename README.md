# Profila

**Générateur de CV optimisés ATS, avec un assistant IA pour les améliorer.**
Profila produit des CV d'une page, lisibles par les logiciels de recrutement (ATS), dont l'aperçu
est exactement le PDF téléchargé. Il s'adresse en particulier aux élèves-ingénieurs et jeunes
diplômés à la recherche d'un stage ou d'un premier emploi.

[![CI / CD](https://github.com/bahToureOumarToure/profila-app/actions/workflows/ci.yml/badge.svg)](https://github.com/bahToureOumarToure/profila-app/actions/workflows/ci.yml)
![React 18](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Licence MIT](https://img.shields.io/badge/licence-MIT-green)

**Application :** [profila.app](https://profila.app)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts](#scripts)
- [Tests](#tests)
- [Architecture](#architecture)
- [Déploiement](#déploiement)
- [Sécurité et confidentialité](#sécurité-et-confidentialité)
- [Contribuer](#contribuer)
- [Licence et auteur](#licence-et-auteur)

---

## Fonctionnalités

### Mise en page et export
- **4 templates une colonne** (Ingénieur, Académique, Moderne, Minimaliste) : texte réel extractible,
  titres de sections standards, liens lisibles et cliquables, métadonnées PDF renseignées.
- **Aperçu fidèle** : l'aperçu affiche le PDF réel (pdf.js), avec compteur de pages.
- **Ajustement automatique sur une page** : espacements puis taille du texte resserrés si nécessaire
  (jamais sous 88 %).
- **Personnalisation** : polices embarquées (Source Serif 4, Inter, Carlito, Lato, Roboto), couleur,
  densité, taille du texte, format des dates, ordre, titres et visibilité des sections, photo et icônes.
- **Mise en valeur** : titre professionnel en couleur, mots-clés du profil en gras (bouton dédié ou
  détection automatique des compétences citées), option de couleur pour les mots-clés.

### Contenu
- Expériences et projets en puces (une réalisation par ligne), avec une ligne **Stack technique**
  homogène sous chaque élément ; libellé configurable.
- **Projets académiques et personnels** imprimés dans deux sections distinctes, avec leur cadre
  (« PFA – ENIAD »).
- **Langues** sur l'échelle européenne A1 → C2, avec plages (« A2/B1 »), langue maternelle ou bilingue,
  qualificatif automatique et précision libre.
- **Activités parauniversitaires** (associations, clubs, BDE, bénévolat), compétitions, certifications,
  distinctions, centres d'intérêt.
- Sauvegarde automatique dans le navigateur, annulation des modifications en bloc, import et export JSON,
  CV d'exemple.

### Intelligence artificielle (Google Gemini)
- **Import d'un CV PDF** : extraction du texte dans le navigateur, structuration par l'IA, pré-remplissage
  de l'éditeur.
- **Assistant conversationnel** : dialogue sur le CV à jour et l'offre ciblée ; les modifications sont
  proposées en avant / après et appliquées une par une après validation. Aucune information n'est inventée.
- **Coach offre** : score de compatibilité avec une annonce et optimisations ciblées.

### Analyse ATS
- Analyse **locale et instantanée** (sans IA) : coordonnées, dates, puces, résultats chiffrés, titres non
  standards, langues sans niveau, nombre de pages. Chaque constat mène au champ à corriger.

---

## Stack technique

| Domaine | Technologies |
|---|---|
| Interface | React 18, Vite 5, Material UI 5, Emotion, React Router 6 |
| PDF | @react-pdf/renderer (génération), pdf.js (aperçu, extraction de texte) |
| IA | API Google Gemini via une fonction serveur Vercel (`/api/gemini`) |
| État | Context API + `useReducer`, persistance `localStorage`, migration des données |
| Qualité | ESLint, Vitest (unitaires et rendu PDF), Playwright (scénario de bout en bout) |
| CI/CD | GitHub Actions, Vercel |

---

## Démarrage rapide

**Prérequis :** Node.js 20 ou supérieur (la CI utilise Node.js 22) et npm.

```bash
git clone https://github.com/bahToureOumarToure/profila-app.git
cd profila-app
npm install
cp .env.example .env.local   # puis renseigner GEMINI_API_KEY
npm run dev                  # http://localhost:5173
```

L'éditeur, l'aperçu, l'export PDF et l'analyse ATS fonctionnent sans clé. Les fonctions IA nécessitent
`GEMINI_API_KEY` ; en local, `npm run dev` et `npm run preview` servent aussi la route `/api/gemini`.

---

## Variables d'environnement

Toutes ces variables sont lues **côté serveur** uniquement (fonction `/api/gemini`).

| Variable | Obligatoire | Description |
|---|---|---|
| `GEMINI_API_KEY` | Pour les fonctions IA | Clé de l'API Gemini ([Google AI Studio](https://aistudio.google.com/app/apikey)). |
| `GEMINI_MODEL` | Non | Modèle utilisé. Par défaut : `gemini-2.5-flash`. |
| `ALLOWED_ORIGINS` | Non | Domaines supplémentaires autorisés à appeler `/api/gemini`, séparés par des virgules. Le domaine du site est toujours autorisé. |

> **Important :** ne préfixez jamais la clé par `VITE_`. Toute variable `VITE_*` est intégrée en clair
> dans le JavaScript livré au navigateur. Les fichiers `.env` et `.env.local` sont ignorés par Git.

---

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (avec `/api/gemini`). |
| `npm run build` | Build de production dans `dist/`. |
| `npm run preview` | Sert le build localement (avec `/api/gemini`). |
| `npm run lint` | Analyse ESLint (zéro avertissement toléré). |
| `npm test` | Tests Vitest : helpers, migration, analyse ATS, assistant, relais Gemini, rendu PDF. |
| `npm run test:e2e` | Scénario Playwright complet sur un build servi (Gemini simulé). |

---

## Tests

```bash
npm run lint
npm test                        # tests unitaires et rendu PDF des 4 templates
PROFILA_PDF_OUT=out npm test    # écrit en plus les PDF générés dans ./out
npm run build && npm run preview &
npm run test:e2e                # E2E_BASE_URL=http://localhost:4173 par défaut
```

Les tests de rendu vérifient pour chaque template : une page, texte extractible dans l'ordre de lecture,
liens cliquables, métadonnées PDF, couleurs effectivement appliquées. Le scénario E2E couvre l'éditeur,
les templates, l'assistant (réponses simulées), l'annulation, le téléchargement et l'affichage mobile.

---

## Architecture

```
api/
└── gemini.js            Fonction serveur Vercel : relais sécurisé vers Gemini
server/
├── geminiProxy.js       Logique du relais (origine, débit, filtrage, appel Gemini)
└── viteGeminiPlugin.js  Même route /api/gemini en dev et en preview
src/
├── ai/                  Client IA, prompts, assistant, coach, import PDF, validation des réponses
├── components/
│   ├── ai/              Assistant, import PDF, coach offre
│   ├── editor/          Formulaires, onglet Design, analyse ATS
│   ├── preview/         Aperçu du PDF réel (pdf.js)
│   └── pdf/             Moteur de rendu, thèmes des templates, polices, ajustement sur une page
├── context/             État du CV (sauvegarde, annulation), thème
├── data/                Modèle de données, migration des anciens CV, CV d'exemple
├── pages/               Accueil, éditeur, pages légales
└── utils/               Dates, puces, liens, niveaux de langue, analyse ATS
e2e/                     Scénario de bout en bout (Playwright)
```

**Flux IA :** navigateur → `POST /api/gemini` (même domaine) → fonction serveur → API Gemini.
Les réponses de l'IA sont validées côté client (identifiants, champs autorisés, formats) avant d'être
proposées à l'utilisateur.

---

## Déploiement

### Vercel (recommandé)
1. Importer le dépôt dans Vercel (framework détecté : Vite).
2. Définir `GEMINI_API_KEY` (et éventuellement `GEMINI_MODEL`) dans
   **Settings → Environment Variables** pour Production et Preview.
3. Chaque fusion dans `main` est déployée en production ; chaque pull request obtient un aperçu.

`vercel.json` configure le routage de l'application monopage (hors `/api`) et les en-têtes HTTP.

### Intégration continue
Le workflow `.github/workflows/ci.yml` s'exécute sur chaque push et pull request :

1. **Qualité** : installation, lint, tests Vitest, build (artefact `dist/`).
2. **Test fonctionnel** : build servi et scénario Playwright (captures d'écran en artefact).
3. **Déploiement** (sur `main`) : déploiement Vercel par la CLI si les secrets `VERCEL_TOKEN`,
   `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID` sont définis dans GitHub ; sinon l'étape est ignorée et
   l'intégration Git de Vercel assure le déploiement.

### Hébergement statique (Apache, Nginx…)
Le contenu de `dist/` peut être servi tel quel ; le `.htaccess` fourni gère le routage et le type MIME
des modules de pdf.js. Les fonctions IA ne sont alors pas disponibles, faute de fonction serveur.

---

## Sécurité et confidentialité

- **Clé API côté serveur uniquement** : elle n'est jamais présente dans le JavaScript du site
  (le build est vérifié : aucune clé ni URL Google dans `dist/`).
- **Relais protégé** : méthode POST uniquement, appels acceptés depuis le domaine du site, taille des
  requêtes bornée, champs transmis à Gemini filtrés, limite de 40 requêtes par adresse IP sur 10 minutes.
- **Clé Google** : restreindre la clé à l'API *Generative Language* dans Google Cloud Console.
  Ne pas utiliser de restriction par référent HTTP : les appels partent du serveur.
- **Données** : le CV est stocké dans le navigateur (`localStorage`). L'aperçu, le PDF et l'analyse ATS
  sont calculés localement. Les fonctions IA, facultatives, transmettent le texte nécessaire (CV hors
  photo, offre, messages) à Google Gemini, via la fonction serveur qui ne conserve aucune donnée.

---

## Contribuer

1. Créer une branche à partir de `main`.
2. Vérifier localement `npm run lint`, `npm test` et, pour les changements d'interface, `npm run test:e2e`.
3. Ouvrir une pull request : la CI doit être verte avant la fusion.

---

## Licence et auteur

Distribué sous licence MIT.

**Bah Omar Touré** —
[Portfolio](https://bahoumartoure.vercel.app) ·
[LinkedIn](https://www.linkedin.com/in/bahoumartoure/) ·
[GitHub](https://github.com/bahToureOumarToure) ·
o.t.bahtoure@gmail.com
