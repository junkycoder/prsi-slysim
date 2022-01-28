import functions from "firebase-functions";
import admin from "firebase-admin";
import { createNewGame, addPlayer, playerGameCopy } from "prsi";

/**
 * Callable function to create a new game.
 */
export const create = functions
  .region("europe-west1")
  .https.onCall(
    async ({ maxPlayers = 6, dealedCards = 4, playerName }, context) => {
      if (!context.auth || !context.auth.token || !context.auth.token.email) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Založit hru může pouze ověřený uživatel."
        );
      }

      if (!playerName) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte jméno hráče."
        );
      }

      if (!maxPlayers || maxPlayers < 2 || maxPlayers > 8) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte počet hráčů v rozmezí 2 až 8."
        );
      }

      if (!dealedCards || dealedCards < 1 || dealedCards > 6) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Zadejte počet karet v rozmezí 1 až 6."
        );
      }

      const db = admin.firestore();

      return db.runTransaction(async (batch) => {
        // Private game accessible only to the server.
        const ref = db.collection("games").doc();
        const doc = await batch.get(ref);

        const game = createNewGame({
          maxPlayers: Number(maxPlayers),
          dealedCards: Number(dealedCards),
        });

        addPlayer(game, { id: context.auth.uid, name: playerName });

        const meta = {
          id: doc.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: context.auth.uid,
        };

        batch.set(ref, {
          ...game,
          ...meta,
        });

        const copy = playerGameCopy(context.auth.uid, game);
        await batch.commit();

        return { ...copy, ...meta };
      });
    }
  );

export const copyPlayerGame = functions
  .region("europe-west1")
  .firestore.document("games/{gameId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const game = change.after.data();

    return db.runTransaction(async (batch) => {
      for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        batch.set(
          db.collection(`users/${player.id}/games`).doc(game.id),
          playerGameCopy(player.id, game)
        );
      }

      await batch.commit();
    });
  });

/**
 * Callable function to add a player to an existing game.
 */
export const join = functions
  .region("europe-west1")
  .https.onCall(async ({ playerName }, context) => {
    if (!playerName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Zadejte jméno hráče."
      );
    }
  });

/**
 * Callable function to leave a game.
 */
export const leave = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {});
