import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import io from "socket.io-client";
import Confetti from "react-confetti";

const Game = () => {
  const { user } = useContext(UserContext);
  const { gameId } = useParams();
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedObject, setSelectedObject] = useState(null);
  const [playerGuess, setPlayerGuess] = useState("");
  const [lastGuess, setLastGuess] = useState(null);
  const [proximityHint, setProximityHint] = useState("");
  const [currentTurn, setCurrentTurn] = useState(null);
  const [showPlayerJoinedAlert, setShowPlayerJoinedAlert] = useState(false);
  const [turnTimer, setTurnTimer] = useState(null);
  const [canPlay, setCanPlay] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`http://localhost:3000/game/${gameId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'état du jeu");
        }

        const gameState = await response.json();

        if (gameState.finished) {
          setGameFinished(true);
          setWinner(gameState.winner);
        } else {
          initSocket();
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (user && user.token) {
      fetchGameState();
    }

    return () => {
      if (turnTimer) {
        clearTimeout(turnTimer);
      }
    };
  }, [gameId, user]);

  useEffect(() => {
    let interval;
    if (currentTurn && currentTurn !== user.id && gameStarted && !gameFinished) {
      setTimeLeft(20);
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentTurn, user.id, gameStarted, gameFinished]);

  const initSocket = () => {
    const newSocket = io("http://localhost:3000", {
      query: { token: user.token },
    });
    setSocket(newSocket);

    newSocket.on("connect_error", () => {
      setErrorMessage("Erreur de connexion au serveur de jeu.");
    });

    newSocket.emit("joinGame", gameId, user.id);

    newSocket.on("playerJoined", (playerId) => {
      if (playerId !== user.id) {
        console.log("Player joined");
        setShowPlayerJoinedAlert(true);
        setTimeout(() => setShowPlayerJoinedAlert(false), 5000);
      }
    });

    newSocket.on("isGameCreator", (creatorId) => {
      if (creatorId === user.id) {
        setIsGameCreator(true);
      }
    });

    newSocket.on("playersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on("gameStarted", (data) => {
      setGameStarted(true);
      setSelectedObject(data.object);
    });

    newSocket.on("turnUpdate", (data) => {
      setCurrentTurn(data.currentTurn);
      setCanPlay(data.currentTurn === user.id);
      
      if (turnTimer) {
        clearTimeout(turnTimer);
      }
      
      if (data.currentTurn !== user.id) {
        const timer = setTimeout(() => {
          setCanPlay(true);
          socket.emit("timeoutTurn", gameId);
        }, 20000);
        setTurnTimer(timer);
      }
    });

    newSocket.on("gameUpdate", (data) => {
      setLastGuess(data.lastGuess);
      if (data.proximityHint) {
        setProximityHint(data.proximityHint);
      }
    });

    newSocket.on("gameFinished", (data) => {
      setGameFinished(true);
      setWinner(data.winner);
      if (turnTimer) {
        clearTimeout(turnTimer);
      }
    });

    return () => {
      if (turnTimer) {
        clearTimeout(turnTimer);
      }
      newSocket.close();
    };
  };

  const startGame = async () => {
    if (socket && isGameCreator) {
      socket.emit("startGame", gameId);
    }
  };

  const handleGuess = () => {
    if (socket && playerGuess && canPlay) {
      socket.emit("makeGuess", gameId, {
        guess: parseFloat(playerGuess),
        userId: user.id,
        token: user.token,
      });
      setPlayerGuess("");
      setCanPlay(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition duration-300">
      {showPlayerJoinedAlert && (
        <div role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Un joueur a rejoint la pertie, vous pouvez désormais la débuter</span>
        </div>
      )}

      {winner && <Confetti />}

      {errorMessage && (
        <div className="bg-red-500 text-white p-4 rounded mb-4 shadow-md">
          {errorMessage}
        </div>
      )}

      {gameFinished ? (
        <div className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center w-full max-w-md">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            Partie terminée !
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Le vainqueur est : <span className="font-bold">{winner}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Félicitations au gagnant ! 🎉
          </p>
        </div>
      ) : !gameStarted ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            La partie n'a pas encore commencé
          </h2>
          {players.length < 2 && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              En attente d'un autre joueur...
            </p>
          )}
          {isGameCreator && players.length >= 2 && (
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-full shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition duration-300"
            >
              Démarrer la partie
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6 w-full max-w-md text-center animate__animated animate__fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-400">
            Devinez le prix
          </h2>

          {currentTurn && (
            <div className={`mb-4 p-3 rounded-lg ${
              currentTurn === user.id 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            }`}>
              <p className="font-semibold">
                {currentTurn === user.id 
                  ? "C'est votre tour !" 
                  : `En attente de l'autre joueur (${timeLeft}s)`
                }
              </p>
            </div>
          )}

          {selectedObject && (
            <div className="mb-4">
              <img
                src={selectedObject.image}
                alt="Object"
                className="h-64 w-full object-cover rounded-md shadow-md"
              />
              <p className="text-xl font-semibold mt-2 text-gray-700 dark:text-gray-300">
                {selectedObject.name} {selectedObject.price}
              </p>
            </div>
          )}

          <div className="mb-4">
            <input
              type="number"
              value={playerGuess}
              onChange={(e) => setPlayerGuess(e.target.value)}
              disabled={!canPlay}
              className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                !canPlay ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Devinez le prix"
            />
            <button
              onClick={handleGuess}
              disabled={!canPlay}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-8 rounded-full shadow-md transition duration-300 mt-4 ${
                canPlay 
                  ? 'hover:shadow-xl hover:from-blue-600 hover:to-purple-600' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Soumettre votre devinette
            </button>
          </div>

          {lastGuess && (
            <div className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              <p>Dernière devinette : {lastGuess} €</p>
              <p className="font-bold">{proximityHint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;