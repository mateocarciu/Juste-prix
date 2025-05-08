# Le Juste Prix

Le Juste Prix is a web application game where users must guess the exact price of a displayed item. The project is divided into two parts: a backend API developed with Fastify and Sequelize, and a frontend interface developed with Preact and Vite.

## Features

- **Sign Up and Login**: Users can sign up and log in.
- **Dark Mode**: Users can toggle between light and dark modes.
- **Game Creation and Participation**: Users can create games and participate in them.
- **Guess the Price**: Users must guess the exact price of the displayed item.
- **Real-Time Notifications**: Users receive real-time notifications via Socket.IO.

## Technologies Used

- **Backend**: Fastify, Sequelize, MySQL, Nodemailer, Socket.IO
- **Frontend**: Preact, Vite, TailwindCSS, DaisyUI, Formik, Yup

## Installation

### Backend

1. Clone the repository.
2. Navigate to the `jdr-lotr-back` directory.
3. Install dependencies:

   ```sh
   yarn install
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables.
5. Start the development server:

   ```sh
   yarn dev
   ```

### Frontend

1. Navigate to the `front` directory.
2. Install dependencies:

   ```sh
   yarn install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.
4. Start the development server:

   ```sh
   yarn dev
   ```
