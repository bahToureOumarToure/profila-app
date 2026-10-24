# 📄 Profila - CV Builder

> Créez un CV professionnel **optimisé ATS**, dialoguez avec un assistant IA pour l'améliorer,
> et exportez un PDF d'une page identique à l'aperçu.

🌐 **Live Demo :** [profila.app](https://profila.app)

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![MUI](https://img.shields.io/badge/MUI-5-007fff?logo=mui)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![CI](https://github.com/bahToureOumarToure/profila-app/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Fonctionnalités

- 🧾 **4 templates optimisés ATS** — Ingénieur (style LaTeX), Académique, Moderne, Minimaliste :
  une seule colonne, texte réel extractible, titres de sections standards, liens lisibles **et** cliquables,
  métadonnées PDF (titre, auteur, mots-clés).
- 👁️ **Aperçu = PDF final** — l'aperçu affiche le vrai PDF (pdf.js) : mêmes polices, mêmes espacements,
  même pagination que le fichier téléchargé, avec compteur de pages.
- 📏 **Ajustement automatique sur 1 page** — resserre espacements puis taille du texte (jamais sous 88 %)
  quand le CV déborde légèrement. Densité (compact / normal / aéré) et taille du texte réglables.
- 💬 **Assistant IA conversationnel** — on dialogue avec son CV (« rends mon profil plus percutant »,
  « condense en une page », « avis de recruteur ? »). L'assistant voit le CV à jour et l'offre ciblée,
  propose des modifications en **avant / après**, que l'on applique une par une. Rien n'est inventé.
- ↩️ **Annuler** — chaque modification en bloc (IA, import, réinitialisation) crée un point de restauration.
- ✅ **Analyse ATS locale** — score et constats concrets (coordonnées, dates, puces, chiffres, titres
  non standards, nombre de pages…), sans clé API ni envoi de données. Un clic mène au champ à corriger.
- 🎯 **Coach offre** — score de compatibilité avec une annonce et optimisations ciblées.
- 📥 **Import PDF par IA** — pré-remplit l'éditeur à partir d'un ancien CV.
- ✍️ **Rédaction guidée** — une réalisation par ligne = une puce, `**gras**` pour un mot-clé,
  stack technique par expérience, disponibilité (« Stage PFE – Février 2027 »), portfolio, dates mois/année.
- 🎨 **Design** — polices nettes embarquées (Source Serif 4, Inter, Carlito ≈ Calibri, Lato, Roboto),
  couleur, format des dates, ordre / titres / visibilité des sections, photo et icônes optionnelles.
- 💾 **Sauvegarde automatique** (localStorage), import / export JSON, CV d'exemple.
- 📱 **Responsive** — mobile, tablette, desktop.

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | React 18 + Vite 5 |
| UI Library | Material UI v5 + Emotion |
| PDF | @react-pdf/renderer (génération) + pdf.js (aperçu, extraction) |
| IA | API Gemini (REST, sortie JSON validée côté client) |
| State Management | Context API + useReducer (+ points de restauration) |
| Tests | Vitest (unitaires + rendu PDF), Playwright (E2E) |
| CI/CD | GitHub Actions, Vercel |

---

## 🏗️ Architecture

```
src/
├── ai/                  # Client Gemini, prompts, assistant conversationnel, coach, import PDF
├── components/
│   ├── ai/              # Panneau assistant, import PDF, coach offre
│   ├── editor/          # Sections du formulaire, onglet Design, analyse ATS
│   ├── preview/         # Aperçu = rendu pdf.js du PDF réel
│   └── pdf/             # Moteur de rendu unique (ResumeDocument), thèmes, polices, auto-ajustement
├── context/             # CVContext (état, autosave, annulation), ThemeContext
├── data/                # Modèle de données, migration des anciens CV, CV d'exemple
├── pages/               # HomePage, BuilderPage, pages légales
└── utils/               # Helpers (dates, puces, liens), analyse ATS
e2e/                     # Scénario de test fonctionnel (navigateur réel, IA simulée)
```

---

## 🚀 Démarrage rapide

```bash
npm install
npm run dev          # développement
npm run build        # build production
npm run preview      # sert le build
```

La clé Gemini est lue depuis `VITE_GEMINI_API_KEY` (fichier `.env`). Sans clé, tout fonctionne
sauf les fonctions IA (l'analyse ATS reste disponible).

## 🧪 Tests

```bash
npm run lint
npm test                         # Vitest : helpers, migration, analyse ATS, assistant, rendu PDF des 4 templates
PROFILA_PDF_OUT=out npm test     # écrit aussi les PDF générés dans ./out pour inspection
npm run build && npx vite preview --port 4173 &
npm run test:e2e                 # scénario complet dans Chromium (Gemini simulé)
```

Les tests de rendu vérifient pour chaque template : une page, texte extractible dans l'ordre de
lecture, liens cliquables, métadonnées PDF, absence de balises `**` résiduelles.

---

## 📦 Déploiement & CI/CD

Le workflow `.github/workflows/ci.yml` s'exécute à chaque push et pull request :

1. **quality** — `npm ci`, lint, tests Vitest, build ; le dossier `dist/` est publié en artefact ;
2. **e2e** — sert le build et joue le scénario Playwright (captures d'écran en artefact) ;
3. **deploy** — sur `main` uniquement, déploie sur Vercel si les secrets `VERCEL_TOKEN`,
   `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID` sont définis (Settings → Secrets → Actions) ; sinon il est ignoré.

`vercel.json` configure le routage SPA et les en-têtes. Pour un hébergement Apache, uploadez `dist/`
(le `.htaccess` inclus gère le routage SPA et le type MIME des modules `.mjs` de pdf.js).

---

## 🔐 Confidentialité

Le CV est stocké dans le navigateur (localStorage) ; l'aperçu, le PDF et l'analyse ATS sont calculés
localement. Les fonctions IA sont facultatives : lorsqu'on les utilise, le texte nécessaire (CV hors photo,
offre, messages) est envoyé à l'API Gemini.

---

## 📄 Licence

MIT © [Bah Omar Touré](https://bahoumartoure.vercel.app)

---

## 👤 Auteur

**Bah Omar Touré**

- 🌐 Portfolio : [bahoumartoure.vercel.app](https://bahoumartoure.vercel.app)
- 💼 LinkedIn : [bahoumartoure](https://www.linkedin.com/in/bahoumartoure/)
- 💻 GitHub : [@bahToureOumarToure](https://github.com/bahToureOumarToure)
- 📧 Email : o.t.bahtoure@gmail.com

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui mettre une étoile !
