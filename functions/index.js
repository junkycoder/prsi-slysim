/**
 * Prší backend functions
 */

import admin from "firebase-admin";

admin.initializeApp();

export {
  create as createGame,
  join as joinGame,
  move as gameMove,
  triggers
} from "./game.js";
export { userAuthenticated } from "./user.js";
