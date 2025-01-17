# Le Juste Prix

Le Juste Prix est une application web de jeu où les utilisateurs doivent deviner le prix exact d'un objet affiché. Le projet est divisé en deux parties : une API backend développée avec Fastify et Sequelize, et une interface frontend développée avec Preact et Vite.

## Fonctionnalités

- **Inscription et Connexion** : Les utilisateurs peuvent s'inscrire et se connecter.
- **Mode Sombre** : Les utilisateurs peuvent basculer entre le mode clair et le mode sombre.
- **Création et Participation à des Jeux** : Les utilisateurs peuvent créer des jeux et y participer.
- **Deviner le Prix** : Les utilisateurs doivent deviner le prix exact de l'objet affiché.
- **Notifications en Temps Réel** : Les utilisateurs reçoivent des notifications en temps réel via Socket.IO.

## Technologies Utilisées

- **Backend** : Fastify, Sequelize, MySQL, Nodemailer, Socket.IO
- **Frontend** : Preact, Vite, TailwindCSS, DaisyUI, Formik, Yup

## Installation

### Backend

1. Clonez le dépôt.
2. Accédez au répertoire `jdr-lotr-back`.
3. Installez les dépendances :

   ```sh
   yarn install
   ```

4. Créez un fichier `.env` en vous basant sur `.env.example` et configurez vos variables d'environnement.
5. Démarrez le serveur de développement :

   ```sh
   yarn dev
   ```

### Frontend

1. Accédez au répertoire `front`.
2. Installez les dépendances :

   ```sh
   yarn install
   ```

3. Créez un fichier `.env` en vous basant sur `.env.example` et configurez vos variables d'environnement.
4. Démarrez le serveur de développement :

   ```sh
   yarn dev
   ```

## Structure du projet

```
├── front/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── DarkmodeToggle.jsx
│   │   │   ├── game/
│   │   │   ├── layouts/
│   │   │   ├── Navbar.jsx
│   │   ├── context/
│   │   │   ├── UserContext.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VerifyEmail.jsx
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── vite.config.js
├── jdr-lotr-back/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── assets/
│   │   ├── bdd.js
│   │   ├── controllers/
│   │   ├── mailer/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   ├── socket/
├── README.MD
```
