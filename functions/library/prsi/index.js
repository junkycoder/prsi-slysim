/**
 * Czech version of Mau-mau game called Prší.
 *
 * Prepare for godd old school object mutations.
 */

export const name = "Prší";

export const GAME_STATUS = {
  NOT_STARTED: 0,
  STARTED: 1,
};

export const reversedCard = { color: null, value: null };
export const isCardFace = ({ color, value }) => Boolean(color && value);

export const cardValues = [
  "spodek",
  "svršek",
  "sedmička",
  "osmička",
  "devítka",
  "desítka",
  "král",
  "eso",
];

export const cardColors = ["kule", "zelený", "srdce", "žaludy"];

export const cards = new Map();

for (let color of cardColors) {
  for (let value of cardValues) {
    const id = `${value}_${color}`;
    cards.set(id, {
      id,
      color,
      value,
    });
  }
}

export const penalties = {};

export const suffleCards = (_cards = cards) =>
  [..._cards.values()].sort(() => Math.random() - 0.5);

export function createNewGame({ maxPlayers = 4, dealedCards = 4 } = {}) {
  return {
    turn: 0,
    status: GAME_STATUS.NOT_STARTED,
    settings: {
      maxPlayers,
      dealedCards,
    },
    players: [],
    spectators: [],
    currentPlayer: null,
    currentColor: null,
    deck: suffleCards(),
    playedCards: [],
    penalty: null,
    outcome: null,
  };
}

export function playerGameCopy(
  playerId,
  {
    turn,
    status,
    settings,
    currentPlayer,
    penalty,
    outcome,
    players,
    spectators,
    deck,
    playedCards,
  }
) {
  return {
    turn,
    status,
    settings,
    currentPlayer: {
      ...currentPlayer,
      cards:
        currentPlayer.id === playerId
          ? currentPlayer.cards
          : currentPlayer.cards.map((card) => reversedCard),
    },
    penalty,
    outcome,
    players: players.map(({ id, cards, ...player }) => ({
      id,
      ...player,
      cards: playerId === id ? cards : cards.map(() => reversedCard),
    })),
    spectators,
    deck: deck.map(() => reversedCard),
    playedCards: [
      ...playedCards.slice(-2),
      ...playedCards.slice(0, -2).map(() => reversedCard),
    ],
    you: true,
  };
}

export function spectactorGameCopy(spectator, game) {
  return playerGameCopy(spectator.id, game);
}

export function addPlayer(game, { id, name, cards = [] }) {
  if (game.players.find((player) => player.id === id)) {
    throw new Error("Player already exists");
  }

  const currentPlayersCount = game.players.length;
  const newPlayer = { id, name, cards };

  if (!currentPlayersCount) {
    game.currentPlayer = newPlayer;
  }

  if (currentPlayersCount < game.settings.maxPlayers) {
    game.players.push(newPlayer);
  } else {
    throw new Error("Game is full");
  }
}

export function addSpectator(game, { id, name }) {
  if (game.spectators.find((spectator) => spectator.id === id)) {
    throw new Error("Spectator already exists");
  }
  game.spectators.push({ id, name });
}

export function getPlayer(game, id) {
  const player = game.players.find((player) => player.id == id);

  return {
    ...player,
  };
}

export function getLastPlayedCard(game) {
  return game.playedCards[game.playedCards.length - 1];
}

export const isWinner = (p) => p.cards.length === 0;

export * as moves from "./moves.js";
export * as autopilot from "./autoplay.js";
