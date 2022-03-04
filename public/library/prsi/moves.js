import {
  GAME_STATUS,
  shuffleCards,
  getLastPlayedCard,
  endTurn,
  STAY_CARD_VALUE,
  CHANGE_CARD_VALUE,
  DRAW_CARD_VALUE,
} from "./index.js";

export function shuffleDeck(game, player) {
  if (game.status === GAME_STATUS.STARTED) {
    throw new Error("Game has already started");
  }

  if (game.status === GAME_STATUS.OVER) {
    game.status = GAME_STATUS.NOT_STARTED;
    game.turn = 0;

    game.players = [
      game.outcome.winner,
      ...game.players.filter(({ id }) => id !== game.outcome.winner.id),
    ];

    for (let player of game.players) {
      game.deck.push(...player.cards);
      player.cards = [];
    }

    game.lastMove = null;
  }

  game.deck = shuffleCards(game.deck);
  game.deckShuffled = true;
}

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
}

export function play(game, { id: playerId }, { id: cardId }, color) {
  const player = game.players.find(({ id }) => id === playerId);
  const card = player.cards.find((card) => card.id === cardId);
  const lastPlayedCard = getLastPlayedCard(game);

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
    !game.lastMove?.stood &&
    card.value !== STAY_CARD_VALUE
  ) {
    throw new Error("Only card you can play is " + STAY_CARD_VALUE);
  }

  if (
    lastPlayedCard.value === DRAW_CARD_VALUE &&
    !game.lastMove?.drawn &&
    card.value !== DRAW_CARD_VALUE
  ) {
    throw new Error("Only card you can play is " + DRAW_CARD_VALUE);
  }

  player.cards = player.cards.filter((c) => c.id !== card.id);
  game.playedCards.push(card);

  if (card.value === CHANGE_CARD_VALUE) {
    if (color) {
      game.currentColor = color;
    } else {
      throw new Error("Color is required");
    }
  } else {
    game.currentColor = card.color;
  }

  endTurn(game, player, play.name, { card, color });
}

export function draw(game, player) {
  const n = game.drawCardsCount;

  if (game.deck.length < n) {
    throw new Error("Not enough cards in deck");
  }

  // toddo: check if player can draw and how many cards he has to draw
  for (let i = 0; i < n; i++) {
    const card = game.deck.shift();
    // game.currentPlayer.cards.push(card);
    game.players.find(({ id }) => player.id === id).cards.push(card);
  }

  endTurn(game, player, draw.name, { drawn: n });
}

export function stay(game, player) {
  if (
    getLastPlayedCard(game).value !== STAY_CARD_VALUE &&
    !game.lastMove?.stood
  ) {
    throw new Error("You can't stay twice");
  }
  endTurn(game, player, stay.name, { stood: true });
}

export function flipPlayedCardsToDeck(game, player) {
  const lastPlayedCard = game.playedCards.pop();
  game.deck = [...game.playedCards].reverse();
  game.playedCards = [lastPlayedCard];
}

export function leave() {
  throw new Error("Not implemented");
  // endTurn(game, player, leave.name);
}
