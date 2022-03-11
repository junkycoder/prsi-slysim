import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import minimist from "minimist";
import path from "path";

const dirname = new URL(import.meta.url).pathname
  .split("/")
  .slice(0, -1)
  .join("/");

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  dirname,
  "./service-account.json"
);

initializeApp({
  credential: applicationDefault(),
  projectId: "prsi-slysim",
});

const db = getFirestore();

const args = minimist(process.argv.slice(2), {
  string: ["doc", "replay", "id"],
  boolean: ["users", "games", "check-copies", "update-stats", "delete-copies"],
  // default: { emulation: false },
});

if (args.doc) {
  const doc = await db.doc(args.doc).get();
  console.log(JSON.stringify(doc.data(), null, 2));
}

if (args.users) {
  const users = await listAllUsers();
  for (let { email, id } of users) {
    const gamesCount = await userGamesCount(id);
    console.log(email, gamesCount);
  }
  console.log(users.length);
}

if (args.games) {
  const games = await listAllGames();
  for (let { id, players = [], moves = [] } of games) {
    console.log(id, moves.length, players.map(({ name }) => name).join(", "));
  }
  console.log(games.length);
}

if (args.replay) {
  const doc = await db.doc(`play/private/game/${args.replay}`).get();
  const game = doc.data();
  console.warn(
    "Těžšký přehrát hru, když nevim jak byl zamíchanej balíček. Znám jen všechny tahy a co zbylo."
  );
}

if (args["check-copies"]) {
  if (!args.id) {
    throw new Error("--id of game is required");
  }

  const report = ({ exists }, { path }) => `${exists ? "👌" : "👎"} ${path}`;

  let query = db.doc(`play/private/game/${args.id}`);

  const game = await query.get();
  if (game.exists) console.log(report(game, query));

  const { players } = game.data();

  for (query of [
    db.doc(`play/public/game/${args.id}`),
    ...players.map((player) => db.doc(`play/${player.id}/game/${args.id}`)),
  ]) {
    const doc = await query.get();
    console.log(report(doc, query));
  }
}

if (args["update-stats"]) {
  const games = await listAllGames();
  const stats = {
    games: games.length,
    players: 0,
    winner: "",
    moves: 0,
  };

  const leaderboard = {};

  for (let { players = [], moves = [] } of games) {
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

  stats.players += Object.keys(leaderboard).length;
  const [leader] = Object.values(leaderboard).sort((a, b) => b.count - a.count);
  stats.winner = leader;

  await db.doc("public/stats").set(stats, { merge: true });
  console.info("Stats updated", stats);
}

if (args["delete-copies"]) {
  if (!args.id) {
    throw new Error("--id of game is required");
  }
  const doc = await db.doc(`play/private/game/${args.id}`).get();
  if (!doc.exists) {
    throw new Error(`Game ${args.id} does not exist`);
  }
  const { players } = doc.data();
  await Promise.all(
    [...players.map(({ id }) => id), "public", "private"].map((perspective) => {
      const path = `play/${perspective}/game/${args.id}`;
      console.info(`Deleting ${path}`);
      return db.doc(path).delete();
    })
  );
}

if (args["simple-stats"]) {
  const users = await listAllUsers();
  console.info(users.length, `users`);
  const games = await listAllGames();
  console.info(games.length, `games`);
  const lastGameDate = games.splice(-1)[0].createdAt.toDate().toLocaleString();
  console.info(`${lastGameDate} last`);
}

if (args["fix-wins"]) {
  const games = await listAllGames();
  for (let { id, wins, round } of games) {
    if (wins === undefined) {
      const path = `play/private/game/${id}`;
      await db.doc(path).update({ wins: [], round: "nah" });
      console.log(path, "updated...");
    } else {
      console.log(id, wins.length, "👌", round);
    }
  }
}

async function listAllGames(nextPageToken) {
  const page = await db
    .collection(`play/private/game`)
    .limit(1000)
    .orderBy("createdAt")
    .get();
  const data = page.docs.map((doc) => doc.data());

  return data;
}

async function userGamesCount(userId) {
  const page = await db.collection(`play/${userId}/game`).limit(1000).get();
  const count = page.docs.length;

  return count;
}

async function listAllUsers(nextPageToken) {
  const list = [];
  const page = await getAuth().listUsers(1000, nextPageToken);

  for (let user of page.users) {
    const { email, uid } = user.toJSON();
    list.push({ email, id: uid });
  }

  if (page.pageToken) {
    list.push(...(await listAllUsers(page.pageToken)));
  }

  return list;
}
