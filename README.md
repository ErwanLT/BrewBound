<div align="center">
  <div style="background-color: #f59e0b; width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(245,158,11,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a.5.5 0 0 1-.5-.5V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1a.5.5 0 0 1-.5.5c-.78 0-1.5-.5-2.5-.5Z"/><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/></svg>
  </div>
  <h1>BrewBound</h1>
  <p><strong>L'explorateur collaboratif de brasseries artisanales</strong></p>
</div>

---

## 🍺 À propos de BrewBound

BrewBound est une application interactive permettant de découvrir les brasseries artisanales locales et leurs bières "On Tap". L'application repose sur un modèle de données **Open Data** et collaboratif : chaque utilisateur peut suggérer l'ajout d'une nouvelle brasserie ou d'une nouvelle bière directement depuis l'interface.

### Fonctionnalités clés :
- **Carte Interactive** : Localisez les meilleures brasseries autour de vous (Leaflet).
- **Exploration détaillée** : Consultez les horaires, descriptions et adresses.
- **Menu "On Tap"** : Découvrez les bières actuellement disponibles pour chaque établissement.
- **Mode Collaboratif** : Proposez des modifications qui génèrent automatiquement des **Pull Requests sur GitHub**.

## 🛠 Installation locale

**Prérequis :** Node.js (v18+)

1.  **Cloner le dépôt**
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
3.  **Configurer les variables d'environnement** :
    Créez un fichier `.env` à la racine (voir `.env.example`) :
    ```env
    GITHUB_TOKEN="votre_token_personnel"
    GITHUB_REPO_OWNER="votre_nom_utilisateur"
    GITHUB_REPO_NAME="BrewBound"
    ```
4.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:3000`.

## 📂 Structure du projet

- `server.ts` : Serveur Express gérant l'intégration GitHub et le middleware Vite.
- `src/App.tsx` : Interface principale (React + Tailwind + Leaflet).
- `src/data/` : Fichiers JSON contenant les données des brasseries et des bières.

## 🤝 Contribution

BrewBound est un projet communautaire. Si vous souhaitez améliorer l'interface ou ajouter des fonctionnalités, n'hésitez pas à ouvrir une Pull Request !

---
*Développé avec passion pour la craft beer.*
