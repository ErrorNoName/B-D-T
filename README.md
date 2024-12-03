# B-D-T (Backup & Lookup Tool) 🛠️

![License](https://img.shields.io/github/license/ErrorNoName/B-D-T?style=flat-square)
![Issues](https://img.shields.io/github/issues/ErrorNoName/B-D-T?style=flat-square)
![Version](https://img.shields.io/github/package-json/v/ErrorNoName/B-D-T?style=flat-square)

**B-D-T** est un outil complet pour la sauvegarde et la recherche de données Discord. Il permet de sauvegarder des messages privés, des images, et des informations sur les serveurs, tout en offrant une fonctionnalité avancée de recherche et de traitement des données sauvegardées.

---

## 📋 Fonctionnalités

- **Backup des données Discord** :
  - Sauvegarde des messages privés (DM) avec des utilisateurs.
  - Téléchargement et organisation des images envoyées via Discord.
  - Exportation des informations des serveurs (guilds) au format JSON.
- **Recherche et traitement (Lookup)** :
  - Recherche de mots-clés dans les fichiers texte sauvegardés.
  - Traitement interactif des résultats (ouvrir ou envoyer à un webhook Discord).
- **Gestion des webhooks** :
  - Sauvegarde et réutilisation des webhooks pour des envois automatisés.
- **Interface interactive** :
  - Choix des actions directement dans la console.
  - Gestion intuitive des sauvegardes disponibles.
- **Sécurisé et extensible** :
  - Vérification des tokens Discord.
  - Validation des URLs de webhook.

---

## 🚀 Installation

### Prérequis

1. **Node.js** : Assurez-vous d'avoir Node.js installé sur votre machine (version 14 ou supérieure).
2. **Dépendances requises** :
   - `discord.js-selfbot-v13`
   - `fs`
   - `readline`
   - `path`
   - `axios`
   - `form-data`

Installez les dépendances avec la commande suivante :

```bash
npm install discord.js-selfbot-v13 fs readline path axios form-data
```

### Installation

Clonez ce dépôt et accédez au dossier du projet :

```bash
git clone https://github.com/ErrorNoName/B-D-T.git
cd B-D-T
```

---

## 🛠️ Utilisation

Exécutez le script avec Node.js :

```bash
node backup_lookup.js
```

### Fonctionnement interactif

1. **Choix de l'action** :
   - **1 : Backup** → Sauvegarde des données Discord.
   - **2 : Lookup** → Recherche et traitement des sauvegardes existantes.
2. **Processus Backup** :
   - Saisissez votre token Discord.
   - Le script sauvegarde automatiquement les messages, images et serveurs.
   - Les données sont organisées dans des dossiers par utilisateur.
3. **Processus Lookup** :
   - Choisissez un backup existant.
   - Recherchez un mot-clé dans les fichiers sauvegardés.
   - Traitez les fichiers trouvés en les ouvrant ou en les envoyant à un webhook.

---

## 📂 Structure des fichiers

```
B-D-T/
├── backup_lookup.js       # Script principal
├── Backup/                # Dossier généré contenant les sauvegardes
├── webhooks.json          # Configuration des webhooks
├── README.md              # Documentation
```

---

## 🌟 Fonctionnalités avancées

### Backup
- Sauvegarde **organisée et structurée** :
  - Les messages privés sont enregistrés dans des fichiers texte.
  - Les images sont téléchargées et organisées par utilisateur.
  - Les informations des serveurs sont exportées au format JSON.

### Lookup
- **Recherche efficace** :
  - Parcours récursif des fichiers texte pour trouver les mots-clés.
  - Interface intuitive pour sélectionner et traiter les résultats.

### Webhooks
- **Gestion intelligente** :
  - Vérification des URLs des webhooks avant chaque envoi.
  - Sauvegarde des webhooks dans un fichier JSON pour une réutilisation rapide.

---

## ⚠️ Avertissements

- **Utilisation responsable** : Cet outil est uniquement destiné à un usage personnel. Respectez les [Conditions d'utilisation de Discord](https://discord.com/terms).
- **Sécurité des tokens** : Ne partagez jamais votre token Discord avec qui que ce soit.
- **Webhooks** : Assurez-vous que vos webhooks sont sécurisés et ne contiennent pas de données sensibles.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous avez des suggestions ou souhaitez ajouter des fonctionnalités, suivez ces étapes :

1. Forkez ce dépôt.
2. Créez une branche : `git checkout -b feature/nom-de-la-feature`.
3. Commitez vos modifications : `git commit -m 'Ajout de la fonctionnalité feature'`.
4. Poussez vos modifications : `git push origin feature/nom-de-la-feature`.
5. Soumettez une Pull Request.

---

## 📜 Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](https://github.com/ErrorNoName/B-D-T/blob/main/LICENSE) pour plus d'informations.

---

## 📧 Contact

Si vous avez des questions ou des retours, contactez-moi via [mon profil GitHub](https://github.com/ErrorNoName).

---

_"Simplifiez vos sauvegardes Discord."_ - **ErrorNoName**
