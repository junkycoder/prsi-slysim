import * as Game from "./Game.js";
import { inspect } from "util";

const logObj = (obj) =>
  console.log(inspect(obj, { showHidden: false, depth: null, colors: true }));

console.assert(
  Game.cards.size === 32,
  "Game.cards.size === 32",
  Game.cards.size
);

for (let [, card] of Game.cards) {
  console.assert(
    Game.isCardFace(card),
    "Game.isCardFace(card)",
    Game.isCardFace(card)
  );
  console.assert(
    card.color !== undefined,
    "card.color !== undefined",
    card.color
  );
  console.assert(
    card.value !== undefined,
    "card.value !== undefined",
    card.value
  );
}

console.assert(
  Game.isCardFace(Game.reversedCard) === false,
  "Game.isCardFace(Game.reversedCard) === false",
  Game.isCardFace(Game.reversedCard)
);
console.assert(
  Game.reversedCard.value === null,
  "Game.reversedCard.value === null",
  Game.reversedCard.value
);
console.assert(
  Game.reversedCard.color === null,
  "Game.reversedCard.color === null",
  Game.reversedCard.color
);

const g = Game.createNewGame({ maxPlayers: 3, dealCardsCount: 4 });

console.assert(g.started === false, "g.started === false", g.started);
console.assert(
  g.players.length === 0,
  "g.players.length === 0",
  g.players.length
);
console.assert(g.deck.length === 32, "g.deck.length === 32", g.deck.length);
console.assert(
  g.playedCards.length === 0,
  "g.playedCards.length === 0",
  g.playedCards.length
);

Game.addPlayer(g, { id: "1", name: "Dan" });
Game.addPlayer(g, { id: "2", name: "Pepa" });
Game.addPlayer(g, { id: "3", name: "Franta" });

try {
  Game.addPlayer(g, { id: "4", name: "Cizák" });
} catch (e) {
  console.assert(
    e.message === "Game is full",
    "e.message === 'Game is full'",
    e.message
  );
}

const p = Game.getPlayer(g, "1");

console.assert(p.id !== undefined, "p.id !== undefined", p.id);
console.assert(p.name !== undefined, "p.name !== undefined", p.name);
console.assert(p.cards.length === 0, "p.cards.length === 0", p.cards.length);

console.assert(
  p.id === g.currentPlayer.id,
  "p.id === g.currentPlayer.id",
  p.id,
  g.currentPlayer.id
);

const player1Moves = Game.makePlayerMoves(g, p);

player1Moves.suffleDeck();
player1Moves.dealCards();

console.assert(
  g.deck.length === 32 - 4 * 3 - 1,
  "g.deck.length === 32 - (4 * 3) - 1",
  g.deck.length
);

const p2 = Game.getPlayer(g, "2");
console.assert(p2.id === "2", "p2.id === '2'", p2.id === "2");

console.assert(
  g.currentPlayer.id === p2.id,
  "g.currentPlayer.id === p2.id",
  g.currentPlayer.id
);

try {
  Game.makePlayerMoves(g, p2).suffleDeck();
} catch (e) {
  console.assert(
    e.message === "Game has already started",
    "e.message === 'Game has already started'",
    e.message
  );
}

while (g.outcome === null) {
  Game.autoplay(g);
  // logObj(g);
}

// const p3 = Game.getPlayer(g, "3");
// const player3Moves = Game.makePlayerMoves(g, p3);

// console.assert(
//   g.currentPlayer.id === p3.id,
//   "g.currentPlayer.id === p3.id",
//   g.currentPlayer.id
// );
