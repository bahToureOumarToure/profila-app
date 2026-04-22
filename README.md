# 📄 Profila — CV Builder

> Créez votre CV professionnel en ligne, gratuitement.
> Templates modernes, éditeur temps réel, export PDF haute qualité.

🌐 **Live Demo :** [profila.app](https://profila.app)

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![MUI](https://img.shields.io/badge/MUI-5-007fff?logo=mui)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Fonctionnalités

- 🎨 **3 templates professionnels** — Moderne, Classique, Minimaliste
- ⚡ **Éditeur temps réel** — prévisualisation instantanée pendant la saisie
- 📄 **Export PDF haute qualité** — PDF natif A4 via `@react-pdf/renderer`
- 🌓 **Dark / Light mode** — préférence persistée
- 🎨 **Personnalisation complète** — 6 palettes de couleurs, 3 polices
- 💾 **Sauvegarde automatique** — localStorage, aucune donnée envoyée
- 📤 **Import / Export JSON** — sauvegardez et restaurez vos CV
- 🔄 **Drag & Drop** — réordonnez vos sections
- 📱 **100% Responsive** — mobile, tablette, desktop
- 🔒 **Privacy-first** — aucun tracking, aucun cookie, aucun serveur

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | React 18 + Vite 5 |
| UI Library | Material UI v5 + Emotion |
| Routing | React Router v6 (lazy loading) |
| State Management | Context API + useReducer |
| PDF Generation | @react-pdf/renderer |
| Drag & Drop | react-beautiful-dnd |
| SEO | react-helmet-async |

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── common/          # SEOHead, composants partagés
│   ├── layout/          # Navbar, Footer, AppLayout
│   ├── editor/
│   │   ├── sections/    # 7 sections de formulaire
│   │   └── controls/    # Composants réutilisables
│   ├── preview/
│   │   └── templates/   # 3 templates HTML temps réel
│   └── pdf/
│       └── templates/   # Templates PDF @react-pdf
├── context/             # CVContext, ThemeContext
├── data/                # Modèle de données CV
├── hooks/               # Hooks personnalisés
├── pages/               # HomePage, BuilderPage, pages légales
├── theme/               # Thème MUI + design tokens
└── utils/               # Helpers
```

---

## 🚀 Démarrage rapide

```bash
# Cloner le repo
git clone https://github.com/bahToureOumarToure/profila.git
cd profila

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

---

## 📦 Déploiement

Compatible avec tout hébergeur statique (Apache, Nginx, Vercel, Netlify).
Le fichier `.htaccess` pour Apache est inclus (SPA routing).

```bash
npm run build
# Upload le contenu de dist/ sur votre hébergeur
```

---

## 🎨 Templates disponibles

| Template | Description |
|----------|-------------|
| **Moderne** | Sidebar latérale colorée, design contemporain |
| **Classique** | Élégant, sobre — idéal secteurs traditionnels |
| **Minimaliste** | Épuré, typographique, très lisible |

---

## 🔐 Confidentialité

Profila ne collecte **aucune donnée personnelle**.
Toutes vos informations restent dans votre navigateur (localStorage).
Aucun serveur, aucun tracking, aucun cookie.

---

## 📄 Licence

MIT © [Bah Omar Touré](https://bahoumartoure.com)

---

## 👤 Auteur

**Bah Omar Touré**

- 🌐 Site web : [bahoumartoure.com](https://bahoumartoure.com)
- 💼 LinkedIn : [bahoumartoure](https://www.linkedin.com/in/bahoumartoure/)
- 💻 GitHub : [@bahToureOumarToure](https://github.com/bahToureOumarToure)
- 📧 Email : o.t.bahtoure@gmail.com

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui mettre une étoile !
