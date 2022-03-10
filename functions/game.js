import functions from "firebase-functions";
import admin from "firebase-admin";
import {
  createNewGame,
  addPlayer,
  playerGameCopy,
  moves,
  getPlayer,
  autopilot,
  GAME_STATUS,
} from "prsi";

/**
 * Callable function to create a new game.
 */
export const create = functions
  .region("europe-west1")
  .https.onCall(
    async ({ maxPlayers = 6, dealCards = 4, cpuPlayers = 0 }, context) => {
      if (!context.auth || !context.auth.token || !context.auth.token.email) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Založit hru může pouze ověřený uživatel."
        );
      }

      if (!maxPlayers || maxPlayers < 2 || maxPlayers > 8) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte počet hráčů v rozmezí 2 až 8."
        );
      }

      if (!dealCards || dealCards < 1 || dealCards > 6) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte počet karet v rozmezí 1 až 6."
        );
      }

      if (cpuPlayers && Number(cpuPlayers) > 2) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte počet CPU hráčů v rozmezí 0 až 2."
        );
      }

      const db = admin.firestore();
      const refPrivate = db.collection("play/private/game").doc();
      const refPublic = db.collection("play/public/game").doc(refPrivate.id);
      const batch = db.batch();

      const game = createNewGame({
        maxPlayers: Number(maxPlayers),
        dealCards: Number(dealCards),
        cpuPlayers: Number(cpuPlayers),
      });

      const meta = {
        id: refPrivate.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth.uid,
      };

      batch.set(refPrivate, {
        ...game,
        ...meta,
      });

      const copy = playerGameCopy(null, game);
      batch.set(refPublic, copy);

      await batch.commit();

      return { ...copy, ...meta };
    }
  );

/**
 * Callable function to add a player to an existing game.
 */
export const join = functions
  .region("europe-west1")
  .https.onCall(async ({ playerName, gameId }, context) => {
    if (!context.auth || !context.auth.token || !context.auth.token.email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Zapojit se do hry může pouze ověřený uživatel."
      );
    }

    if (!gameId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Chybí game ID!"
      );
    }

    if (!playerName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Zadejte jméno hráče."
      );
    }

    const db = admin.firestore();
    const ref = db.collection("play/private/game").doc(gameId);

    return await db.runTransaction(async (batch) => {
      const game = (await batch.get(ref)).data();
      const player = { id: context.auth.uid, name: playerName };

      if (!game) {
        throw new functions.https.HttpsError("not-found", "Hra neexistuje.");
      }

      if (game.players.length >= game.settings.maxPlayers) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Hra je plná."
        );
      } else {
        addPlayer(game, player);
      }

      batch.update(ref, game, { merge: true });

      return {
        game: playerGameCopy(context.auth.uid, game),
      };
    });
  });

/**
 * Callable function to leave a game.
 */
export const leave = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {});

/**
 * Callable function to make an game move
 */
export const move = functions
  .region("europe-west1")
  .https.onCall(async ({ moveType, gameId, card, color }, context) => {
    if (!context.auth || !context.auth.token || !context.auth.token.email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Zapojit se do hry může pouze ověřený uživatel."
      );
    }

    if (!gameId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Chybí game ID!"
      );
    }

    if (!moveType) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Zadejte typ tahu."
      );
    }

    const db = admin.firestore();
    const ref = db.doc(`play/private/game/${gameId}`);

    try {
      return await db.runTransaction(async (batch) => {
        const game = (await batch.get(ref)).data();
        const player = getPlayer(game, context.auth.uid);

        if (player.id !== game.currentPlayer.id) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Nejste na tahu."
          );
        }

        if (moves[moveType]) {
          moves[moveType](game, player, card, color);
        } else {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Neplatný typ tahu."
          );
        }

        batch.update(ref, game, { merge: true });
        return {
          game: playerGameCopy(context.auth.uid, game),
        };
      });
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        "unknown",
        error.message || "Chyba při provádění tahu."
      );
    }
  });

/**
 * Triggers putting every thing togheter
 */
export const triggers = functions
  .region("europe-west1")
  .firestore.document("play/private/game/{gameId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const game = change.after.data();
    const batch = db.batch();

    if (game) {
      await makeGameCopies(game, { db, batch });

      if (game.turn > change.before.data().turn) {
        await makeCpuMove(game, { db, batch }); // witch can produce another call of this trigger 😈
      }
    }

    await batch.commit();
  });

/**
 * 1. function that keeps game copies in sync.
 */
async function makeGameCopies(game, { db, batch }) {
  for (const player of game.players.filter(({ cpu }) => !cpu)) {
    batch.set(
      db.collection(`play/${player.id}/game`).doc(game.id),
      playerGameCopy(player.id, game)
    );
  }

  batch.set(
    db.collection(`play/public/game`).doc(game.id),
    playerGameCopy(null, game)
  );
}

/**
 * 2. function that makes cpu moves.
 */
async function makeCpuMove(game, { db, batch }) {
  if (game?.status !== GAME_STATUS.STARTED) return;
  if (!game?.currentPlayer?.cpu) return;

  autopilot.autoplay(game);

  const ref = db.collection(`play/private/game`).doc(game.id);
  batch.update(ref, game, {
    merge: true,
  });
}
