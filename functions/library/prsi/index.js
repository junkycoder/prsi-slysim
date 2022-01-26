export const name = "Prší";

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

export const GAME_STATUS = {
  NOT_STARTED: 0,
};

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
    currentPlayer: null,
    currentColor: null,
    deck: suffleCards(),
    playedCards: [],
    penalty: null,
    outcome: null,
  };
}

export function removeSecrets({
  turn,
  status,
  settings,
  currentPlayer,
  penalty,
  outcome,
  players,
  deck,
  playedCards,
}) {
  return {
    turn,
    status,
    settings,
    currentPlayer: {
      ...currentPlayer,
      cards: currentPlayer.cards.map((card) => reversedCard),
    },
    penalty,
    outcome,
    players: players.map(({ cards, ...player }) => ({
      ...player,
      cards: cards.map(() => reversedCard),
    })),
    deck: deck.map(() => reversedCard),
    playedCards: [
      ...playedCards.slice(-1),
      ...playedCards.slice(0, -1).map(() => reversedCard),
    ],
  };
}

export function addPlayer(game, { id, name, cards = [] } = {}) {
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

export function makePlayerMoves(game, player) {
  const { settings, currentPlayer, players, playedCards } = game;
  const isCurrentPlayer = (p) => currentPlayer.id === p.id;

  if (!isCurrentPlayer(player)) {
    throw new Error(`Player ${player.id} is not current player`);
  }

  const isWinner = (p) => p.cards.length === 0;

  const currentPlayerIndex = players.findIndex(({ id }) => id === player.id);
  const currentPlayerCards = players[currentPlayerIndex].cards;

  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];

  // All possible player moves:
  return {
    suffleDeck,
    dealCards,
    play,
    draw,
    stay,
    flipPlayedCardsToDeck,
    leave,
  };

  function suffleDeck() {
    if (game.started) {
      throw new Error("Game has already started");
    }

    game.deck = suffleCards(suffleCards(game.deck));

    console.log(`${game.turn}. ${player.name} suffled deck`);
  }

  function dealCards() {
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

    game.started = true;

    if (firstCard.value === "svršek") {
      const { color } = game.deck[game.deck.length - 1];
      console.log(`Used last deck card color "${color}"`);
      endTurn({ color });
    } else {
      endTurn();
    }
  }

  function play(card, { color } = {}) {
    if (!card.id) {
      throw new Error("Card is not valid");
    }
    const currentPlayerCardIndex = currentPlayerCards.findIndex(
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

    const [playedCard] = currentPlayerCards.splice(currentPlayerCardIndex, 1);
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

    endTurn({ card, color });
  }

  function draw(n = 1) {
    // toddo: check if player can draw and how many cards he has to draw
    for (let i = 0; i < n; i++) {
      currentPlayerCards.push(game.deck.shift());
    }

    console.log(`${game.turn}. ${player.name} drew ${n} cards`);

    endTurn();
  }

  function stay() {
    // const lastPlayedCard = getLastPlayedCard(game);
    // if (lastPlayedCard.value !== "eso" || game.previousPlayer?.stood) {
    //   throw new Error("Player cannot stay");
    // }
    endTurn({ stood: true });

    console.log(`${game.turn}. ${player.name} staying`);
  }

  function flipPlayedCardsToDeck() {
    const lastPlayedCard = game.playedCards.pop();
    game.deck = [...game.playedCards];
    game.playedCards = [lastPlayedCard];

    console.log(`${game.turn}. ${player.name} flipped played cards to deck`);
  }

  function leave() {
    throw new Error("Not implemented");
    // endTurn();
  }

  function endTurn({ stood = false, color } = {}) {
    player.stood = stood;
    game.previousPlayer = player;
    game.currentPlayer = nextPlayer;

    if (color) {
      game.currentColor = color;
    }

    game.turn++;

    const lastPlayedCard = getLastPlayedCard(game);

    if (isWinner(player)) {
      game.outcome = { winner: player };
      console.log("GAME OVER:\n", game.outcome);
    }
  }
}

export function autoplay(game) {
  const { playedCards, previousPlayer, currentPlayer: player } = game;
  const lastPlayedCard = playedCards[playedCards.length - 1];

  const moves = makePlayerMoves(game, player);

  if (!game.deck.length) {
    moves.flipPlayedCardsToDeck();
  }

  // if (lastPlayedCard.value === "eso" && !previousPlayer?.stood) {
  //   const eso = player.cards.find(({ value }) => value === "eso");

  //   if (eso) {
  //     moves.play(eso);
  //     return;
  //   } else {
  //     moves.stay();
  //     return;
  //   }
  // }

  const sameValueCards = player.cards.filter(
    ({ value }) => value === lastPlayedCard.value
  );

  const sameColorCards = player.cards.filter(
    ({ color }) => color === (game.currentColor || lastPlayedCard.color)
  );

  let cardToPlay;

  if (sameValueCards.length) {
    const [firstCard] = sameValueCards;
    cardToPlay = firstCard;
  }

  if (sameColorCards.length) {
    const [firstCard] = sameColorCards;
    cardToPlay = firstCard;
  }

  if (cardToPlay) {
    if (cardToPlay.value === "svršek") {
      moves.play(cardToPlay, {
        color: mostNumerousColor(player.cards),
      });
    } else {
      moves.play(cardToPlay);
    }
  } else {
    moves.draw();
  }
}

export function mostNumerousColor(cards) {
  const colors = cards.map(({ color }) => color);
  const colorCount = colors.reduce((acc, color) => {
    acc[color] = acc[color] ? acc[color] + 1 : 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(colorCount));

  return Object.keys(colorCount).find(
    (color) => colorCount[color] === maxCount
  );
}
