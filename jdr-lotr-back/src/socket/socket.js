import { Server } from "socket.io";
import fetch from "node-fetch";

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const games = {};

  io.on("connection", (socket) => {
    console.log(`Nouvelle connexion : ${socket.id}`);

    socket.on("joinGame", (gameId, userId) => {
      socket.join(gameId);
      
      // Initialiser le jeu s'il n'existe pas
      if (!games[gameId]) {
        games[gameId] = {
          started: false,
          players: [],
          object: null,
          winner: null,
          currentTurn: null,
          lastGuess: null,
          turnTimeout: null,
          guesses: [], // Historique des devinettes
          currentRound: 0,
          maxPlayers: 2,
        };
      }

      const game = games[gameId];
      
      // Ajouter le joueur s'il n'est pas déjà dans la partie
      if (!game.players.includes(userId) && game.players.length < game.maxPlayers) {
        game.players.push(userId);
        
        // Notifier tous les joueurs qu'un nouveau joueur a rejoint
        io.to(gameId).emit("playerJoined", userId);
        
        // Envoyer la liste mise à jour des joueurs à tout le monde
        io.to(gameId).emit("playersUpdate", game.players);
      }

      // Informer le client s'il est le créateur de la partie
      io.to(socket.id).emit("isGameCreator", game.players[0]);

      // Si la partie est déjà en cours, envoyer l'état actuel au nouveau joueur
      if (game.started) {
        socket.emit("gameStarted", { 
          object: game.object,
          currentTurn: game.currentTurn,
          lastGuess: game.lastGuess
        });
      }
    });

    socket.on("startGame", async (gameId) => {
      try {
        const game = games[gameId];
        
        if (!game || game.started || game.players.length < 2) {
          return;
        }

        // Récupérer un produit aléatoire
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des objets");
        }

        const products = await response.json();
        const randomProduct = products[Math.floor(Math.random() * products.length)];

        // Configurer l'objet du jeu
        game.object = {
          name: randomProduct.title,
          image: randomProduct.image,
          price: randomProduct.price,
        };

        game.started = true;
        game.currentTurn = game.players[0];
        game.currentRound = 1;

        // Notifier tous les joueurs du début de la partie
        io.to(gameId).emit("gameStarted", { 
          object: game.object,
          currentTurn: game.currentTurn 
        });

        // Envoyer l'état initial du tour
        io.to(gameId).emit("turnUpdate", { 
          currentTurn: game.currentTurn 
        });

        // Mettre en place le timeout du tour
        startTurnTimeout(gameId);

        // Mettre à jour l'état du jeu dans la base de données
        try {
          const updateResponse = await fetch(
            `http://localhost:3000/game/start/${gameId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${socket.handshake.query.token}`,
              },
              body: JSON.stringify({
                userId: game.players[0],
                status: "started",
                currentTurn: game.currentTurn,
              }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error("Erreur lors de la mise à jour du jeu dans la base de données");
          }
        } catch (dbError) {
          console.error("Erreur base de données:", dbError);
        }
      } catch (error) {
        console.error("Erreur lors du démarrage de la partie:", error);
        io.to(gameId).emit("gameError", {
          message: "Erreur lors du démarrage de la partie"
        });
      }
    });

    socket.on("makeGuess", async (gameId, data) => {
      const game = games[gameId];

      if (!game || !game.started || game.winner || game.currentTurn !== data.userId) {
        return;
      }

      clearTimeout(game.turnTimeout);

      const playerGuess = parseFloat(data.guess);
      const actualPrice = parseFloat(game.object.price);

      // Enregistrer la devinette
      game.guesses.push({
        userId: data.userId,
        guess: playerGuess,
        timestamp: Date.now()
      });

      // Vérifier si la devinette est correcte
      if (Math.abs(playerGuess - actualPrice) < 0.01) {
        game.winner = data.userId;
        
        // Calculer le score final
        const score = calculateScore(game.guesses, data.userId);

        // Notifier la fin de la partie
        io.to(gameId).emit("gameFinished", { 
          winner: data.userId,
          finalPrice: actualPrice,
          score: score
        });

        // Mettre à jour la base de données
        try {
          const response = await fetch(
            `http://localhost:3000/game/finish/${gameId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({
                userId: data.userId,
                score: score,
                winner: data.userId,
                guesses: game.guesses
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Erreur lors de la finalisation du jeu");
          }
        } catch (error) {
          console.error("Erreur base de données:", error);
        }
      } else {
        // Mettre à jour le tour
        const currentPlayerIndex = game.players.indexOf(data.userId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        game.currentTurn = game.players[nextPlayerIndex];
        game.lastGuess = playerGuess;

        // Calculer l'indice de proximité
        const proximityHint = calculateProximityHint(playerGuess, actualPrice);

        // Notifier les joueurs
        io.to(gameId).emit("gameUpdate", { 
          lastGuess: playerGuess,
          proximityHint: proximityHint
        });

        io.to(gameId).emit("turnUpdate", { 
          currentTurn: game.currentTurn 
        });

        // Démarrer le nouveau timer
        startTurnTimeout(gameId);
      }
    });

    socket.on("timeoutTurn", (gameId) => {
      const game = games[gameId];
      if (!game || !game.started || game.winner) return;

      handleTurnTimeout(gameId);
    });

    socket.on("disconnect", () => {
      console.log(`Déconnexion de ${socket.id}`);
      handlePlayerDisconnect(socket);
    });
  });

  // Fonction utilitaire pour démarrer le timeout du tour
  function startTurnTimeout(gameId) {
    const game = games[gameId];
    if (game.turnTimeout) {
      clearTimeout(game.turnTimeout);
    }

    game.turnTimeout = setTimeout(() => {
      handleTurnTimeout(gameId);
    }, 20000); // 20 secondes
  }

  // Gérer le timeout d'un tour
  function handleTurnTimeout(gameId) {
    const game = games[gameId];
    if (!game || !game.started || game.winner) return;

    const currentPlayerIndex = game.players.indexOf(game.currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextPlayerIndex];

    io.to(gameId).emit("turnUpdate", { 
      currentTurn: game.currentTurn 
    });

    startTurnTimeout(gameId);
  }

  // Gérer la déconnexion d'un joueur
  function handlePlayerDisconnect(socket) {
    // Parcourir tous les jeux pour trouver et nettoyer les parties du joueur déconnecté
    Object.keys(games).forEach((gameId) => {
      const game = games[gameId];
      const player = game.players.find(p => 
        socket.rooms.has(gameId) // Vérifie si le socket était dans cette room
      );

      if (player) {
        // Notifier les autres joueurs
        io.to(gameId).emit("playerLeft", player);
        
        // Si la partie n'est pas terminée, la terminer
        if (game.started && !game.winner) {
          const remainingPlayer = game.players.find(p => p !== player);
          if (remainingPlayer) {
            game.winner = remainingPlayer;
            io.to(gameId).emit("gameFinished", {
              winner: remainingPlayer,
              reason: "disconnect"
            });
          }
        }
      }
    });
  }

  // Calculer l'indice de proximité
  function calculateProximityHint(guess, actualPrice) {
    const diff = Math.abs(actualPrice - guess);
    
    if (diff === 0) return "🎯 Exact !";
    if (diff <= 5) return "🔥 Très très proche !";
    if (diff <= 10) return "🔥 Très proche !";
    if (diff <= 20) return "🙂 Proche";
    if (diff <= 50) return "😐 Moyennement loin";
    if (diff <= 100) return "😐 Loin";
    return "❄️ Très loin";
  }

  // Calculer le score final
  function calculateScore(guesses, winnerId) {
    const playerGuesses = guesses.filter(g => g.userId === winnerId).length;
    const baseScore = 1000;
    const penaltyPerGuess = 50;
    
    return Math.max(baseScore - (playerGuesses - 1) * penaltyPerGuess, 100);
  }

  return io;
}