import React, { useContext } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Navbar from '../../components/Navbar';

const SecureLayout = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  return (
    <>
      <Navbar />
      {location.pathname === "/" ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition duration-300">
          {/* Explication du jeu */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl text-center text-gray-900 dark:text-gray-200">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-400">
              Le Juste Prix
            </h2>
            <p className="text-lg mb-6">
              Le principe est simple : vous devez deviner le prix exact de l'objet qui apparaît en image. Celui qui devine le prix exact gagne la partie ! 
              Chaque joueur peut proposer un prix, et l'autre joueur pourra voir le prix proposé s'il est incorrect, ajoutant ainsi une dimension stratégique.
            </p>
            <p className="text-lg mb-6">
              Les objets proviennent d'une API dédiée qui renvoie des images et des prix d'objets aléatoires. À chaque tour, un nouvel objet est sélectionné au hasard et vous devez trouver son prix.
            </p>
          </div>

          {!user && (
            <div className="mt-8 space-x-4">
              <Link
                to={"/register"}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 hover:from-teal-600 hover:to-cyan-700 text-white py-2 px-6 rounded-full shadow-md transition duration-300"
              >
                S'inscrire
              </Link>
            </div>
          )}

          <div className="absolute bottom-10 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Besoin d'aide ?{' '}
              <span className="underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Contactez le support
              </span>
            </p>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default SecureLayout;
