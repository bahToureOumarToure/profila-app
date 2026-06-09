# 📝 Quiz Dev Perso - Développement Personnel & Soft Skills

Un **QCM interactif hors ligne** pour réviser depuis ton téléphone.
Pas de serveur, pas d'installation, pas de connexion internet nécessaire.

## ✨ Ce que ça fait

- **QCM interactif** : tu choisis une réponse, tu vois immédiatement si c'est juste (vert) ou faux (rouge), avec la bonne réponse mise en évidence
- **59 questions** réparties en **6 blocs** (A, B, C, D, F-1, F-2)
- Les **propositions sont mélangées** à chaque partie (impossible de mémoriser les positions)
- **Score** à la fin avec anneau de progression + **records** sauvegardés par bloc
- **Mes erreurs** : un mode qui ne reprend que les questions ratées, jusqu'à ce que tu les réussisses
- **Examen complet** : les 59 questions mélangées
- **Mode sombre / clair**, lisible, gros boutons tactiles
- Tout enregistré en local (localStorage) : scores et liste « à revoir »

## 📂 Deux fichiers, deux modes

| Fichier | Mode | Pour quoi faire |
|---------|------|-----------------|
| **`index.html`** | 🎓 Révision (par bloc) | S'entraîner avec **correction immédiate** après chaque réponse, suivre ses records par thème |
| **`examen.html`** | 📝 Évaluation (tout mélangé) | Se **tester en conditions d'examen** : 59 questions aléatoires, **sans titre de bloc**, **aucune correction pendant le test**, score + correction détaillée à la fin |

Les deux marchent **hors ligne** et partagent les mêmes 59 questions.

## 📱 Comment l'utiliser sur ton téléphone

1. Récupère le fichier **`index.html`** (envoie-le toi par mail / WhatsApp / Drive).
2. Ouvre-le avec ton navigateur (Chrome, Safari...).
3. *(Optionnel)* Menu du navigateur → **« Ajouter à l'écran d'accueil »** : il s'ouvre comme une vraie app, en plein écran.

Une fois ouvert une première fois, il fonctionne **sans connexion**.

## ⌨️ Raccourcis (sur ordinateur)

- Touches **A / B / C / D** ou **1 / 2 / 3 / 4** : choisir une réponse
- **Entrée** ou **Espace** : question suivante

## 🔤 Note

Tous les caractères « bizarres » (tiret long `—`, signe moins `−`, flèche `→`) ont été
remplacés par des tirets simples `-` / `->` pour une lecture nette.

## 🔒 Confidentialité

Tout reste sur ton appareil. Aucune donnée n'est envoyée nulle part.
