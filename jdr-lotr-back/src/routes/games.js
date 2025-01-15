import {
  createGame,
  updateGame,
  getGameState,
  getOpenGames,
  getFinishedGames
} from "../controllers/games.js";

export function gamesRoutes(app) {
  // Création d'un jeu
  app.post(
    "/game",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await createGame(request.body.userId, reply);
    }
  );

  // Mise à jour d'un jeu
  app.patch(
    "/game/:action/:gameId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await updateGame(request, reply);
    }
  );

  // Récupération de l'état d'un jeu
  app.get(
    "/game/:gameId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await getGameState(request.params.gameId, reply);
    }
  );

  // Récupération des parties ouvertes
  app.get(
    "/games/open",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await getOpenGames(reply);
    }
  );
  app.post(
    "/games/finished",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await getFinishedGames(request.body.userId, reply);
    }
  )
}
