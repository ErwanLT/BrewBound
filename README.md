# 🍺 BrewBound

[![CI](https://github.com/ErwanLT/BrewBound/actions/workflows/ci.yml/badge.svg)](https://github.com/ErwanLT/BrewBound/actions/workflows/ci.yml)
[![Render Status](https://img.shields.io/badge/Render-Live-brightgreen)](https://brewbound.onrender.com)

BrewBound est une application collaborative permettant de cartographier et de découvrir les brasseries artisanales et leurs bières. Conçue comme une plateforme **Open Data**, elle permet à quiconque de contribuer à la base de données via un système de Pull Requests automatisé.

🚀 **Démo en direct :** [https://brewbound.onrender.com](https://brewbound.onrender.com) (Exemple)

---

## ✨ Fonctionnalités

- 🗺️ **Carte Interactive** : Localisez les brasseries sur une carte dynamique (Leaflet).
- 🍺 **Gestion des Bières** : Consultez la liste des bières "On Tap" pour chaque brasserie.
- ✍️ **Mode Collaboratif** : Ajoutez ou éditez des brasseries et des bières directement depuis l'interface.
- 🤖 **Automatisation GitHub** : Chaque modification génère automatiquement une Pull Request sur le dépôt.
- 📝 **Support Markdown** : Les descriptions supportent le texte enrichi (gras, italique, listes) pour une meilleure lisibilité.
- 🌍 **Géocodage Automatique** : Saisissez une adresse, l'application trouve les coordonnées GPS pour vous.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Cartographie** : React-Leaflet / OpenStreetMap.
- **Backend** : Node.js, Express (API de contribution).
- **Intégration** : Octokit (SDK GitHub) pour la gestion automatisée des fichiers de données.

---

## 🤝 Comment contribuer ?

BrewBound repose sur un modèle de données décentralisé stocké dans des fichiers JSON (`src/data/`).

1. **Via l'interface** : Utilisez le bouton "Ajouter" ou l'icône "Éditer" sur une brasserie/bière.
2. **Validation** : Remplissez le formulaire et cliquez sur "Générer la Pull Request".
3. **Review** : Un administrateur examine la proposition sur GitHub et la fusionne si elle est correcte.

---

## 💻 Installation locale

### Prérequis
- Node.js (v18+)
- Un **GitHub Personal Access Token (classic)** avec les permissions `repo`.

### Étapes
1. **Cloner le projet**
   ```bash
   git clone https://github.com/ErwanLT/BrewBound.git
   cd BrewBound
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   GITHUB_TOKEN=votre_token_github
   GITHUB_REPO_OWNER=votre_pseudo_github
   GITHUB_REPO_NAME=BrewBound
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera disponible sur `http://localhost:3000`.

---

## 🚀 Déploiement (ex: Render)

L'application est configurée pour être déployée facilement sur **Render** ou Railway.

1. Liez votre dépôt GitHub à Render.
2. Choisissez le runtime **Node**.
3. **Build Command** : `npm install && npm run build`
4. **Start Command** : `npm start`
5. Ajoutez les variables d'environnement citées plus haut dans le dashboard de Render.

---

## 📁 Structure des données

Les données sont stockées de manière simple pour faciliter l'audit :
- `src/data/breweries.json` : Liste des brasseries.
- `src/data/beers.json` : Liste des bières liées par `breweryId`.

---

⚖️ **Licence** : MIT  
🛠️ **Mainteneur** : [ErwanLT](https://github.com/ErwanLT)
