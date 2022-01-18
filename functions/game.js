import functions from "firebase-functions";

/**
 * New game can be created by verified users
 */

export const create = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token || !context.auth.token.email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Založit hru může pouze ověřený uživatel."
      );
    }

    // TODO: create game with given preferences

    // return game;
  });
