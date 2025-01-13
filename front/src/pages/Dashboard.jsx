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

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
    } else {
      const newSocket = io('http://localhost:3000', {
        query: { token: user.token },
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOpenGames = async () => {
      try {
        const response = await fetch('http://localhost:3000/games/open', {
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

    if (user) {
      fetchOpenGames();
    }
  }, [user]);

  const createGame = async () => {
    try {
      const response = await fetch('http://localhost:3000/game', {
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
      const response = await fetch(`http://localhost:3000/game/join/${gameId}`, {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition duration-300">
      {/* Header Section */}
      <h1 className="text-5xl font-bold mb-12 text-gray-900 dark:text-white tracking-wide">
        Bienvenue, {user.id} 🎮
      </h1>

      {/* Button Create Game */}
      <div className="mb-8">
        {!gameId && (
          <button
            onClick={createGame}
            className="bg-green-500 dark:bg-green-600 text-white py-3 px-8 rounded-full shadow-lg hover:bg-green-600 dark:hover:bg-green-700 hover:shadow-xl transition duration-300"
          >
            Créer une partie
          </button>
        )}
      </div>

      {/* Open Games Section */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 hover:shadow-purple-500/50 transition-shadow duration-300">
        <h2 className="text-3xl font-semibold mb-6 text-purple-600 dark:text-purple-400">
          Parties ouvertes
        </h2>
        {openGames.length > 0 ? (
          <ul className="space-y-6">
            {openGames.map((game) => (
              <li key={game.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <span className="text-xl font-medium text-gray-900 dark:text-gray-200">
                  Partie {game.id} (Créée par {game.creator})
                </span>
                <button
                  onClick={() => joinGame(game.id)}
                  className="bg-purple-500 dark:bg-purple-600 text-white py-2 px-6 rounded-full shadow-md hover:bg-purple-600 dark:hover:bg-purple-700 transition duration-200"
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
    </div>
  );
};

export default Dashboard;
