import functions from "firebase-functions";
import admin from "firebase-admin";
import { createNewGame, addPlayer } from "prsi";
/**
 * New game can be created by verified users
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
      const ref = db.collection("games").doc();

      return db.runTransaction(async (batch) => {
        const doc = await batch.get(ref);
        const game = createNewGame(doc.id, {
          maxPlayers: Number(maxPlayers),
          dealedCards: Number(dealedCards),
        });

        addPlayer(game, { id: context.auth.uid, name: playerName });

        batch.set(ref, game);
        await batch.commit();

        return game;
      });
    }
  );
