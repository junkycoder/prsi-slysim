/**
 * Czech version of Mau-mau game called Prší.
 *
 * Prepare for godd old school object mutations.
 */

export const name = "Prší";

export const GAME_STATUS = {
  NOT_STARTED: 0,
  STARTED: 1,
  OVER: 2,
};

export const REVERSED_CARD = { color: null, value: null };
export const isCardFace = ({ color, value }) => Boolean(color && value);

export const CARD_VALUES = [
  "spodek",
  "svršek",
  "sedmička",
  "osmička",
  "devítka",
  "desítka",
  "král",
  "eso",
];

export const CARD_COLORS = ["kule", "zelený", "srdce", "žaludy"];
export const CHANGE_CARD_VALUE = "svršek";
export const STAY_CARD_VALUE = "eso";
export const DRAW_CARD_VALUE = "sedmička";

export const CARDS = new Map();

for (let color of CARD_COLORS) {
  for (let value of CARD_VALUES) {
    const id = `${value}_${color}`;
    CARDS.set(id, {
      id,
      color,
      value,
    });
  }
}

export const shuffleCards = (cards = CARDS) =>
  [...cards.values()].sort(() => Math.random() - 0.5);

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
    lastMove: null,
    drawCardsCount: 1,
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
    lastMove,
    drawCardsCount,
  }
) {
  return {
    turn,
    status,
    settings,
    currentPlayer: !currentPlayer
      ? null
      : {
          ...currentPlayer,
          cards:
            currentPlayer.id === playerId
              ? currentPlayer.cards
              : currentPlayer.cards.map((card) => REVERSED_CARD),
        },
    currentColor,
    outcome,
    players: players.map(({ id, cards, ...player }) => ({
      id,
      ...player,
      cards: playerId === id ? cards : cards.map(() => REVERSED_CARD),
    })),
    deck: deck.map(() => REVERSED_CARD),
    deckShuffled,
    playedCards: [
      ...playedCards.slice(0, -2).map(() => REVERSED_CARD),
      ...playedCards.slice(-2),
    ],
    lastMove,
    drawCardsCount,
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
  if (!player) {
    return null;
  }
  return { ...player };
}

export function getLastPlayedCard(game) {
  return game.playedCards[game.playedCards.length - 1];
}

export const isWinner = (p) => p.cards.length === 0;

export * as moves from "./moves.js";
export * as autopilot from "./autoplay.js";

/**
 * @private
 * @param {Game} game
 * @param {Player} player
 * @param {Object} options
 */
export function endTurn(
  game,
  player,
  moveType,
  { card = null, stood = false, color = null, drawn = 0 } = {}
) {
  game.previousPlayer = player;
  const playerIndex = game.players.findIndex(({ id }) => id === player.id);
  game.currentPlayer = game.players[(playerIndex + 1) % game.players.length];

  const lastPlayedCard = getLastPlayedCard(game);

  if (color) {
    if (card.value === "svršek") {
      game.currentColor = color;
    } else {
      throw new Error("Player can only use svršek card to change color");
    }
  }

  if (
    card &&
    card.value !== "svršek" &&
    card.value !== lastPlayedCard.value &&
    card.color !== game.currentColor
  ) {
    throw new Error(
      `Player ${player.id} tried to play "${card.value} ${card.color}" but last played card was "${lastPlayedCard.value} ${lastPlayedCard.color}"`
    );
  }

  console.info(
    `${game.turn}. ${[
      player.name,
      moveType,
      card?.id,
      color,
      drawn,
    ]
      .filter(Boolean)
      .join(" ")}`
  );

  game.turn++;

  game.lastMove = {
    player: {
      id: player.id,
      name: player.name,
    },
    type: moveType,
    card,
    color,
    stood,
    drawn,
  };

  game.drawCardsCount = 1;
  if (card?.value === DRAW_CARD_VALUE && !game.lastMove.drawn) {
    game.drawCardsCount =
      [...game.playedCards]
        .reverse()
        .filter((card) => card.value === DRAW_CARD_VALUE).length * 2;
  }

  if (isWinner(player)) {
    game.outcome = { winner: player };
    console.log("GAME OVER:\n", game.outcome);
    game.status = GAME_STATUS.OVER;
  }
}
