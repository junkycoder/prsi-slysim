/**
 * Prší backend functions
 */
import admin from "firebase-admin";
import functions from "firebase-functions";

admin.initializeApp();

export {
  create as createGame,
  join as joinGame,
  move as gameMove,
  triggers,
} from "./game.js";

export { userAuthenticated } from "./user.js";

export const stats = functions
  .region("europe-west1")
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
    const db = admin.firestore();
    const { docs: games } = await db.collection("play/private/game").get();
    const stats = {
      games: games.length,
      players: 0,
      winner: "",
      moves: 0,
    };

    const names = {};

    for (let game of games) {
      const { players = [], moves = [] } = game.data();
      stats.players += players.length;
      stats.moves += moves.length;

      for (let player of players.filter(({ cpu }) => !cpu)) {
        const count = names[player.name] || 0;
        names[player.name] = count + 1;
      }
    }

    const [score] = Object.values(names).sort((a, b) => b - a);
    stats.winner = Object.keys(names).find((key) => names[key] === score);

    await db.doc("public/stats").set(stats, { merge: true });
    console.info("Stats updated", stats);
  });
