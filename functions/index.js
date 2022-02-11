/**
 * Prší backend functions
 */

import admin from "firebase-admin";

admin.initializeApp();

export {
  create as createGame,
  copyPlayerGame,
  join as joinGame,
  move as gameMove,
} from "./game.js";
export { userAuthenticated } from "./user.js";
