import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; 
import io from 'socket.io-client';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState('');
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [openGames, setOpenGames] = useState([]);
  const [finishedGames, setFinishedGames] = useState([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
    } else {
      const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
        query: { token: user.token },
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOpenGames = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/games/open`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des parties ouvertes');
        }

        const data = await response.json();
        setOpenGames(data);
      } catch (error) {
        console.error('Erreur :', error);
      }
    };

    const fetchFinishedGames = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/games/finished`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des parties terminées');
        }

        const data = await response.json();
        setFinishedGames(data);
      } catch (error) {
        console.error('Erreur :', error);
      }
    };

    if (user) {
      fetchOpenGames();
      fetchFinishedGames();
    }
  }, [user]);

  const createGame = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la partie');
      }

      const data = await response.json();
      setGameId(data.gameId);
      setIsGameCreator(true);

      if (socket) {
        socket.emit('joinGame', data.gameId, user.id); 
        navigate(`/game/${data.gameId}`);
      }
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const joinGame = async (gameId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/game/join/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la tentative de rejoindre la partie');
      }

      if (socket) {
        socket.emit('joinGame', gameId, user.id); 
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error('Erreur :', error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 transition duration-300">
      {/* Header Section */}
      <h1 className="text-3xl sm:text-5xl font-bold mb-8 pt-20 sm:mb-12 text-gray-900 dark:text-white tracking-wide text-center">
        Bienvenue, {user.id}
      </h1>

      {/* Button Create Game */}
      <div className="mb-6 sm:mb-8">
        {!gameId && (
          <button
            onClick={createGame}
            className="bg-green-500 dark:bg-green-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg hover:bg-green-600 dark:hover:bg-green-700 hover:shadow-xl transition duration-300"
          >
            Créer une partie
          </button>
        )}
      </div>

      {/* Open Games Section */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-4 sm:p-8 hover:shadow-purple-500/50 transition-shadow duration-300">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-purple-600 dark:text-purple-400">
          Parties ouvertes
        </h2>
        {openGames.length > 0 ? (
          <ul className="space-y-4 sm:space-y-6">
            {openGames.map((game) => (
              <li key={game.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <span className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-200 mb-2 sm:mb-0">
                  Partie {game.id} (Créée par {game.creator})
                </span>
                <button
                  onClick={() => joinGame(game.id)}
                  className="bg-purple-500 dark:bg-purple-600 text-white py-2 px-4 sm:py-2 sm:px-6 rounded-full shadow-md hover:bg-purple-600 dark:hover:bg-purple-700 transition duration-200"
                >
                  Rejoindre
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aucune partie ouverte pour le moment.
          </p>
        )}
      </div>

      {/* Finished Games Section */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-4 sm:p-8 mt-6 sm:mt-8 hover:shadow-purple-500/50 transition-shadow duration-300">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-purple-600 dark:text-purple-400">
          Parties terminées
        </h2>
        {finishedGames.length > 0 ? (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">ID</th>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">Créateur</th>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">Gagnant</th>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">Score du gagnant</th>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">Date de création</th>
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">Date de fin</th>
                </tr>
              </thead>
              <tbody>
                {finishedGames.map((game) => (
                  <tr key={game.id}>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{game.id}</td>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{game.creator}</td>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{game.winner}</td>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{game.winnerScore}</td>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{new Date(game.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">{new Date(game.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aucune partie terminée pour le moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
