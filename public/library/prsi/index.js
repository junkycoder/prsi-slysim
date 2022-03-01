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
export const changeColorCardValue = "svršek";
export const stayCardValue = "eso";

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

export const shuffleCards = (_cards = cards) =>
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
    currentPlayer: null,
    currentColor: null,
    deck: shuffleCards(),
    deckShuffled: false, // it is shuffled but we need user to to it as well
    playedCards: [],
    outcome: null,
    moves: [],
  };
}

export function playerGameCopy(
  playerId,
  {
    turn,
    status,
    settings,
    currentPlayer,
    currentColor,
    outcome,
    players,
    deck,
    deckShuffled,
    playedCards,
    moves,
  }
) {
  return {
    turn,
    status,
    settings,
    currentPlayer: !currentPlayer ? null : ({
      ...currentPlayer,
      cards:
        currentPlayer.id === playerId
          ? currentPlayer.cards
          : currentPlayer.cards.map((card) => reversedCard),
    }),
    currentColor,
    outcome,
    players: players.map(({ id, cards, ...player }) => ({
      id,
      ...player,
      cards: playerId === id ? cards : cards.map(() => reversedCard),
    })),
    deck: deck.map(() => reversedCard),
    deckShuffled,
    playedCards: [
      ...playedCards.slice(-2),
      ...playedCards.slice(0, -2).map(() => reversedCard),
    ],
    moves,
  };
}

export function addPlayer(game, { id, name, cards = [] }) {
  if (game.players.find((player) => player.id === id)) {
    return true;
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
