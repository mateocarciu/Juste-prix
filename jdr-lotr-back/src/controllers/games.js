import Game from "../models/games.js";

export async function createGame(userId, reply) {
  if (!userId) {
    return reply
      .status(400)
      .send({ error: "L'identifiant du joueur est manquant" }); // 400 Bad Request
  }
  const datas = await Game.create({ creator: userId });
  console.log(datas.dataValues.id);
  return reply.status(201).send({ gameId: datas.dataValues.id }); // 201 Created
}

export async function updateGame(request, reply) {
  const userId = request.body.userId;
  const { action, gameId } = request.params;

  // Vérification des paramètres requis
  if (!action || !gameId) {
    return reply.status(400).send({ error: "Action ou identifiant de partie manquant." });
  }

  if (!userId) {
    return reply.status(400).send({ error: "L'identifiant du joueur est manquant." });
  }

  // Récupération de la partie
  const game = await Game.findByPk(gameId);
  if (!game) {
    return reply.status(404).send({ error: "La partie n'existe pas." });
  }

  // Vérification si la partie est déjà terminée
  if (game.state === "finished") {
    return reply.status(400).send({ error: "Cette partie est déjà terminée !" });
  }

  // Gestion des actions
  switch (action) {
    case "join":
      if (game.player1 && game.player2) {
        return reply.status(400).send({ error: "Il y a déjà 2 joueurs dans cette partie !" });
      }
      if (game.state !== "pending") {
        return reply.status(400).send({ error: "Cette partie n'est plus en attente." });
      }

      if (!game.player1) {
        game.player1 = userId; // Ajout du premier joueur
      } else if (!game.player2) {
        game.player2 = userId; // Ajout du deuxième joueur
      }
      break;

    case "start":
      if (!game.player1 || !game.player2) {
        return reply
          .status(400)
          .send({ error: "Deux joueurs sont requis pour démarrer la partie." });
      }
      game.state = "playing";
      break;

    case "finish":
      if (!request.body.score || !request.body.winner) {
        return reply
          .status(400)
          .send({ error: "Le score et le gagnant sont requis pour terminer la partie." });
      }
      game.state = "finished";
      game.winnerScore = request.body.score;
      game.winner = request.body.winner;
      break;

    default:
      return reply.status(400).send({ error: "Action inconnue." });
  }

  // Sauvegarde des modifications
  await game.save();

  // Réponse avec l'état mis à jour
  return reply.status(200).send(game);
}

export async function getGameState(gameId, reply) {
  const game = await Game.findByPk(gameId);
  if (!game) {
    return reply.status(404).send({ error: "La partie n'existe pas." }); // 404 Not Found
  }

  return reply.status(200).send({
    state: game.dataValues.state,
    started: game.dataValues.state === "playing",
    finished: game.dataValues.state === "finished",
    winner: game.dataValues.winner,
  }); // 200 OK
}
export async function getOpenGames(reply) {
  try {
    const games = await Game.findAll({
      where: {
        state: ["pending"], // On récupère les parties qui ne sont pas terminées
      },
    });

    return reply.status(200).send(games); // 200 OK avec la liste des jeux ouverts
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des parties ouvertes :",
      error
    );
    return reply
      .status(500)
      .send({ error: "Erreur serveur lors de la récupération des parties." });
  }
}
