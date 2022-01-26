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
        const privRef = db.collection("games").doc();
        const privDoc = await batch.get(privRef);
        // User's game copy excluding secret data like deck and played cards
        const copyRef = db
          .collection(`/users/${context.auth.uid}/games`)
          .doc(privDoc.id);

        const game = createNewGame({
          maxPlayers: Number(maxPlayers),
          dealedCards: Number(dealedCards),
        });

        addPlayer(game, { id: context.auth.token.email, name: playerName });

        const copy = playerGameCopy(context.auth.token.email, game);
        const meta = {
          id: privDoc.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: context.auth.token.email,
        };

        batch.set(privRef, {
          ...game,
          ...meta,
        });
        batch.set(copyRef, {
          ...copy,
          ...meta,
        });

        await batch.commit();

        return { ...copy, ...meta };
      });
    }
  );

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
