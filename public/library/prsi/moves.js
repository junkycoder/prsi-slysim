import {
  GAME_STATUS,
  shuffleCards,
  getLastPlayedCardReference,
  endTurn,
  STAY_CARD_VALUE,
  CHANGE_CARD_VALUE,
  DRAW_CARD_VALUE,
} from "./index.js";

export const SHUFFLE = shuffleDeck.name;
export function shuffleDeck(game, player) {
  if (game.status === GAME_STATUS.STARTED) {
    throw new Error("Game has already started");
  }

  if (game.status === GAME_STATUS.OVER) {
    game.status = GAME_STATUS.NOT_STARTED;
    game.turn = 0;

    for (let player of game.players) {
      game.deck.push(...player.cards);
      player.cards = [];
    }

    game.deck.push(...game.playedCards);
    game.lastMove = null;

    for (let card of game.deck) {
      card.cold = false;
    }
  }

  game.deck = shuffleCards(game.deck);
  game.deckShuffled = true;

  console.info("Decks shuffled");
}

export const DEAL = dealCards.name;
export function dealCards(game, player) {
  const { settings, players } = game;

  for (let i = 0; i < settings.dealedCards; i++) {
    for (let j = 0; j < players.length; j++) {
      players[j].cards.push(game.deck.shift());
    }
  }

  const firstCard = game.deck.shift();

  game.playedCards.push(firstCard);
  game.currentColor = firstCard.color;

  game.status = GAME_STATUS.STARTED;

  if (firstCard.value === CHANGE_CARD_VALUE) {
    const { color } = game.deck[game.deck.length - 1];
    endTurn(game, player, dealCards.name, { card: firstCard, color });
  } else {
    endTurn(game, player, dealCards.name);
  }

  if (firstCard.value === DRAW_CARD_VALUE) {
    game.drawCount = 2;
  }
}

export const PLAY = play.name;
export function play(game, { id: playerId }, { id: cardId }, color) {
  const player = game.players.find(({ id }) => id === playerId);
  const card = player.cards.find((card) => card.id === cardId);
  const lastPlayedCard = getLastPlayedCardReference(game);

  if (!card) {
    throw new Error(
      `Player ${player.id} does not have card ${card.value} ${card.color}`
    );
  }
  if (game.currentPlayer.id !== player.id) {
    throw new Error("It is not your turn");
  }
  if (
    lastPlayedCard.value === STAY_CARD_VALUE &&
    lastPlayedCard.cold !== true &&
    card.value !== STAY_CARD_VALUE
  ) {
    throw new Error("Only card you can play is " + STAY_CARD_VALUE);
  }

  if (
    lastPlayedCard.value === DRAW_CARD_VALUE &&
    lastPlayedCard.cold !== true &&
    card.value !== DRAW_CARD_VALUE
  ) {
    throw new Error("Only card you can play is " + DRAW_CARD_VALUE);
  }

  if (card.value === CHANGE_CARD_VALUE) {
    if (color) {
      game.currentColor = color;
    } else {
      throw new Error("Color is required");
    }
  } else {
    game.currentColor = card.color;
  }

  game.playedCards.push(card);
  player.cards = player.cards.filter(({ id }) => id !== card.id);

  const hotDrawCards = game.playedCards.filter(
    ({ cold, value }) => !cold && value === DRAW_CARD_VALUE
  );

  if (card.value === DRAW_CARD_VALUE) {
    game.drawCount = hotDrawCards.length * 2;
  } else {
    game.drawCount = 1;
  }

  endTurn(game, player, play.name, { card, color });
}

export const DRAW = draw.name;
export function draw(game, player) {
  const n = game.drawCount;

  if (game.deck.length < n) {
    throw new Error("Not enough cards in deck");
  }

  for (let i = 0; i < n; i++) {
    const card = game.deck.shift();
    game.players.find(({ id }) => player.id === id).cards.push(card);
  }

  game.drawCount = 1;
  getLastPlayedCardReference(game).cold = true;
  endTurn(game, player, draw.name, { drawn: n });
}

export const STAY = stay.name;
export function stay(game, player) {
  const lastPlayedCard = getLastPlayedCardReference(game);

  if (lastPlayedCard.value !== STAY_CARD_VALUE) {
    throw new Error("Only card you can play is " + STAY_CARD_VALUE);
  } else if (lastPlayedCard.cold) {
    throw new Error("This card has been played already");
  }

  lastPlayedCard.cold = true;
  endTurn(game, player, stay.name);
}

export const FLIP_PLAYED_CARDS_TO_DECK = flipPlayedCardsToDeck.name;
export function flipPlayedCardsToDeck(game, player) {
  game.deck.push(...game.playedCards);
  game.playedCards = [game.deck.pop()];

  game.deckShuffled = false;
  console.info(`Played cards flipped to deck by ${player.name}`);
}

export const LEAVE = leave.name;
export function leave() {
  throw new Error("Not implemented");
  // endTurn(game, player, leave.name);
}
