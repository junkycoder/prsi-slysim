import {
  GAME_STATUS,
  shuffleCards,
  getLastPlayedCard,
  isWinner,
} from "./index.js";

/**
 * @private
 * @param {Game} game
 * @param {Player} player
 * @param {Object} options
 */
function endTurn(game, player, { card, stood = false, color } = {}) {
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

  if (isWinner(player)) {
    game.outcome = { winner: player };
    console.log("GAME OVER:\n", game.outcome);
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

export function play(game, player, card, { color } = {}) {
  if (!card.id) {
    throw new Error("Card is not valid");
  }

  if (game.currentPlayer.id !== player.id) {
    throw new Error("It is not your turn");
  }

  const currentPlayerCardIndex = game.currentPlayer.cards.findIndex(
    ({ id: cardId }) => cardId === card.id
  );

  if (currentPlayerCardIndex === -1) {
    throw new Error(
      `Player ${player.id} does not have card ${card.value} ${card.color}`
    );
  }

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

  const [playedCard] = game.currentPlayer.cards.splice(
    currentPlayerCardIndex,
    1
  );
  game.playedCards.push(playedCard);

  if (card.value === "svršek") {
    if (color) {
      game.currentColor = color;
    } else {
      throw new Error("Color is required");
    }
  }

  console.log(
    `${game.turn}. ${player.name} played "${card.value} ${card.color}"`,
    color ? `with color "${color}"` : ""
  );

  endTurn(game, player, { card, color });
}

export function draw(game, player, n = 1) {
  // toddo: check if player can draw and how many cards he has to draw
  for (let i = 0; i < n; i++) {
    game.currentPlayer.cards.push(game.deck.shift());
  }

  console.log(`${game.turn}. ${player.name} drew ${n} cards`);

  endTurn(game, player);
}

export function stay(game, player) {
  endTurn(game, player, { stood: true });

  console.log(`${game.turn}. ${player.name} staying`);
}

export function flipPlayedCardsToDeck(game, player) {
  const lastPlayedCard = game.playedCards.pop();
  game.deck = [...game.playedCards];
  game.playedCards = [lastPlayedCard];

  console.log(`${game.turn}. ${player.name} flipped played cards to deck`);
}

export function leave() {
  throw new Error("Not implemented");
  // endTurn(game, player);
}
