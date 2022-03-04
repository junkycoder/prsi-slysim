import {
  GAME_STATUS,
  shuffleCards,
  getLastPlayedCard,
  isWinner,
  drawCardValue,
} from "./index.js";

/**
 * @private
 * @param {Game} game
 * @param {Player} player
 * @param {Object} options
 */
function endTurn(game, player, { card, stood = false, color, drawn = 0 } = {}) {
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

  game.turn++;

  game.lastMove = {
    player,
    card,
    color,
    stood,
    drawn,
  };

  game.drawCardsCount = 1;

  if (card?.value === drawCardValue && !game.lastMove.drawn) {
    drawCardsCount =
      [...game.playedCards]
        .reverse()
        .filter((card) => card.value === drawCardValue).length * 2;
  }

  if (isWinner(player)) {
    game.outcome = { winner: player };
    console.log("GAME OVER:\n", game.outcome);
    game.status = GAME_STATUS.OVER;
  }
}

export function shuffleDeck(game, player) {
  if (game.status === GAME_STATUS.STARTED) {
    throw new Error("Game has already started");
  }

  game.deck = shuffleCards(game.deck);
  game.deckShuffled = true;

  console.log(`${game.turn}. ${player.name} shuffled deck`);
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

  console.log(
    `${game.turn}. ${player.name} dealed cards, "${firstCard.value} ${firstCard.color}" is on the table`
  );

  game.status = GAME_STATUS.STARTED;

  if (firstCard.value === "svršek") {
    const { color } = game.deck[game.deck.length - 1];
    console.log(`Used last deck card color "${color}"`);
    endTurn(game, player, { card: firstCard, color });
  } else {
    endTurn(game, player);
  }
}

export function play(game, { id: playerId }, { id: cardId }, color) {
  const player = game.players.find(({ id }) => id === playerId);
  const card = player.cards.find((card) => card.id === cardId);

  if (!card) {
    throw new Error(
      `Player ${player.id} does not have card ${card.value} ${card.color}`
    );
  }
  if (game.currentPlayer.id !== player.id) {
    throw new Error("It is not your turn");
  }

  // Fixme: last played card does not means it was not already played
  const lastPlayedCard = getLastPlayedCard(game);

  if (
    card.value !== "svršek" &&
    card.value !== lastPlayedCard.value &&
    card.color !== game.currentColor
  ) {
    throw new Error(
      `Player ${player.id} tried to play "${card.value} ${card.color}" but last played card was "${lastPlayedCard.value} ${lastPlayedCard.color}"`
    );
  }

  player.cards = player.cards.filter((c) => c.id !== card.id);
  game.playedCards.push(card);

  if (card.value === "svršek") {
    if (color) {
      game.currentColor = color;
    } else {
      throw new Error("Color is required");
    }
  } else {
    game.currentColor = card.color;
  }

  console.log(
    `${game.turn}. ${player.name} played "${card.value} ${card.color}"`,
    color ? `with color "${color}"` : ""
  );

  endTurn(game, player, { card, color });
}

export function draw(game, player) {
  if (game.deck.length < game.drawCardValue) {
    throw new Error("Not enough cards in deck");
  }

  // toddo: check if player can draw and how many cards he has to draw
  for (let i = 0; i < game.drawCardValue; i++) {
    const card = game.deck.shift();
    // game.currentPlayer.cards.push(card);
    game.players.find(({ id }) => player.id === id).cards.push(card);
  }

  console.log(`${game.turn}. ${player.name} drew ${n} cards`);

  endTurn(game, player, { drawn: game.drawCardValue });
}

export function stay(game, player) {
  endTurn(game, player, { stood: true });

  console.log(`${game.turn}. ${player.name} staying`);
}

export function flipPlayedCardsToDeck(game, player) {
  const lastPlayedCard = game.playedCards.pop();
  game.deck = [...game.playedCards].reverse();
  game.playedCards = [lastPlayedCard];

  console.log(`${game.turn}. ${player.name} flipped played cards to deck`);
}

export function leave() {
  throw new Error("Not implemented");
  // endTurn(game, player);
}
