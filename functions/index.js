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

    const leaderboard = {};

    for (let game of games) {
      const { players = [], moves = [] } = game.data();
      stats.players += players.length;
      stats.moves += moves.length;

      for (let player of players.filter(({ cpu }) => !cpu)) {
        const score = leaderboard[player.id];
        if (score) {
          leaderboard[player.id] = {
            name: player.name,
            count: score.count + 1,
          };
        } else {
          leaderboard[player.id] = {
            name: player.name,
            count: 1,
          };
        }
      }
    }

    const [leader] = Object.values(leaderboard).sort(
      (a, b) => b.count - a.count
    );
    stats.winner = leader;

    await db.doc("public/stats").set(stats, { merge: true });
    console.info("Stats updated", stats);
  });
