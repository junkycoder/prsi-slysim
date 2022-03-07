import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import minimist from "minimist";
import { moves } from "prsi";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./service-account.json";

initializeApp({
  credential: applicationDefault(),
  projectId: "prsi-slysim",
});

const db = getFirestore();

const args = minimist(process.argv.slice(2), {
  string: ["doc", "replay"],
  boolean: ["users", "games"],
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
}

if (args.games) {
  const games = await listAllGames();
  for (let { id, players = [], moves = [] } of games) {
    console.log(id, moves.length, players.map(({ name }) => name).join(", "));
  }
}

if (args.replay) {
  if (!args.replay) {
    throw "Missing replay argument";
  }
  const doc = await db.doc(`play/private/game/${args.replay}`).get();
  const game = doc.data();
  console.warn(
    "Těžšký přehrát hru, když nevim jak byl zamíchanej balíček. Znám jen všechny tahy a co zbylo."
  );
}

async function listAllGames(nextPageToken) {
  const page = await db.collection(`play/private/game`).limit(1000).orderBy("createdAt").get();
  const data = page.docs.map(doc => doc.data());

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
