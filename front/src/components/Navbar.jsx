import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import DarkModeToggle from './DarkmodeToggle';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (user && user.token) {
      try {
        const response = await fetch('http://localhost:3000/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: user.token }),
        });

        if (response.ok) {
          logout();
          navigate('/login');
        } else {
          console.error('Erreur lors de la déconnexion');
        }
      } catch (error) {
        console.error('Erreur réseau', error);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md dark:shadow-lg transition duration-300 p-4 z-10">
      <ul className="flex justify-between items-center text-gray-800 dark:text-gray-200">
        <li>
          <Link
            to="/"
            className="text-2xl font-bold tracking-wider hover:text-gray-600 dark:hover:text-gray-400 transition duration-300"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/fr/2/22/Logo_Juste_Prix_2024_%28M6%29.png"
              alt="logo"
              className="h-14 w-20"
            />
          </Link>
        </li>
        <li className="flex items-center gap-1">
        <DarkModeToggle />

          {user && user.token ? (
            <>
              <Link
                to="/dashboard"
                className="mr-2 text-lg hover:text-gray-600 dark:hover:text-gray-400 transition duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 hover:from-red-600 hover:to-red-800 text-white py-2 px-6 rounded-full shadow-md transition duration-300"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mr-6 text-lg hover:text-gray-600 dark:hover:text-gray-400 transition duration-300"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 hover:from-teal-600 hover:to-cyan-700 text-white py-2 px-6 rounded-full shadow-md transition duration-300"
              >
                Inscription
              </Link>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
