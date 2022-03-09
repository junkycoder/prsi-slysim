# Prší ESM
Karetní hra [Prší](https://cs.wikipedia.org/wiki/Pr%C5%A1%C3%AD) naimplementovaná v čistém JavaScriptu, bez dalších závislostí. 

## Použtí
```js
import { 
  createNewGame,
  addPlayer,
  moves,
  autopilot,
  getLastPlayedCardReference,
  playerGameCopy,
} from "prsi"; // or https://unpkg.com/prsi

// Game status is an object, mutaded bellow
const game = createNewGame({
  maxPlayers: 3,
  cpuPlayers: 1, 
  dealCards: 4,
});

addPlayer(game, { id: "1", name: "Jiří" });
addPlayer(game, { id: "2", name: "Tomáš" });

const player1 = getPlayer(game, "1");
const player2 = getPlayer(game, "2");

// 👌 returns what can player1 see
playerGameCopy(player1.id, game);
// 👌 returns what can player2 see
playerGameCopy(player2.id, game);
// 👌 returns what can anybody (public) see
playerGameCopy(null, game);

moves.shuffleDeck(game, player1);
moves.dealCards(game, player1);

// 👇 returns card on table
getLastPlayedCardReference(game)

// 👇 Play card 
moves.play(game, player2, {
  type: moves.PLAY,
  card: player2.cards[0],
  color: autopilot.mostNumerousColor(
    player2.cards
  ),
});

// Make draw move 
// 👇  (adds 1 card from deck to player)
moves.play(game, player1, {
  type: moves.DRAW
});

// Autopilot can make moves for you, 
// 👇 (so it's used in tests and as CPU players)
while (!game.outcome) {
  autopilot.autoplay(game);
}

```

### Doumentace
```js
[Module: null prototype] {
  CARDS: Map(32) {
    'spodek_kule' => { id: 'spodek_kule', color: 'kule', value: 'spodek' },
    'svršek_kule' => { id: 'svršek_kule', color: 'kule', value: 'svršek' },
    'sedmička_kule' => { id: 'sedmička_kule', color: 'kule', value: 'sedmička' },
    'osmička_kule' => { id: 'osmička_kule', color: 'kule', value: 'osmička' },
    'devítka_kule' => { id: 'devítka_kule', color: 'kule', value: 'devítka' },
    'desítka_kule' => { id: 'desítka_kule', color: 'kule', value: 'desítka' },
    'král_kule' => { id: 'král_kule', color: 'kule', value: 'král' },
    'eso_kule' => { id: 'eso_kule', color: 'kule', value: 'eso' },
    'spodek_zelený' => { id: 'spodek_zelený', color: 'zelený', value: 'spodek' },
    'svršek_zelený' => { id: 'svršek_zelený', color: 'zelený', value: 'svršek' },
    'sedmička_zelený' => { id: 'sedmička_zelený', color: 'zelený', value: 'sedmička' },
    'osmička_zelený' => { id: 'osmička_zelený', color: 'zelený', value: 'osmička' },
    'devítka_zelený' => { id: 'devítka_zelený', color: 'zelený', value: 'devítka' },
    'desítka_zelený' => { id: 'desítka_zelený', color: 'zelený', value: 'desítka' },
    'král_zelený' => { id: 'král_zelený', color: 'zelený', value: 'král' },
    'eso_zelený' => { id: 'eso_zelený', color: 'zelený', value: 'eso' },
    'spodek_srdce' => { id: 'spodek_srdce', color: 'srdce', value: 'spodek' },
    'svršek_srdce' => { id: 'svršek_srdce', color: 'srdce', value: 'svršek' },
    'sedmička_srdce' => { id: 'sedmička_srdce', color: 'srdce', value: 'sedmička' },
    'osmička_srdce' => { id: 'osmička_srdce', color: 'srdce', value: 'osmička' },
    'devítka_srdce' => { id: 'devítka_srdce', color: 'srdce', value: 'devítka' },
    'desítka_srdce' => { id: 'desítka_srdce', color: 'srdce', value: 'desítka' },
    'král_srdce' => { id: 'král_srdce', color: 'srdce', value: 'král' },
    'eso_srdce' => { id: 'eso_srdce', color: 'srdce', value: 'eso' },
    'spodek_žaludy' => { id: 'spodek_žaludy', color: 'žaludy', value: 'spodek' },
    'svršek_žaludy' => { id: 'svršek_žaludy', color: 'žaludy', value: 'svršek' },
    'sedmička_žaludy' => { id: 'sedmička_žaludy', color: 'žaludy', value: 'sedmička' },
    'osmička_žaludy' => { id: 'osmička_žaludy', color: 'žaludy', value: 'osmička' },
    'devítka_žaludy' => { id: 'devítka_žaludy', color: 'žaludy', value: 'devítka' },
    'desítka_žaludy' => { id: 'desítka_žaludy', color: 'žaludy', value: 'desítka' },
    'král_žaludy' => { id: 'král_žaludy', color: 'žaludy', value: 'král' },
    'eso_žaludy' => { id: 'eso_žaludy', color: 'žaludy', value: 'eso' }
  },
  CARD_COLORS: [ 'kule', 'zelený', 'srdce', 'žaludy' ],
  CARD_VALUES: [
    'spodek',   'svršek',
    'sedmička', 'osmička',
    'devítka',  'desítka',
    'král',     'eso'
  ],
  CHANGE_CARD_VALUE: 'svršek',
  DRAW_CARD_VALUE: 'sedmička',
  GAME_STATUS: { NOT_STARTED: 0, STARTED: 1, OVER: 2 },
  REVERSED_CARD: { color: null, value: null },
  STAY_CARD_VALUE: 'eso',
  addPlayer: [Function: addPlayer],
  autopilot: [Module: null prototype] {
    autoplay: [Function: autoplay],
    mostNumerousColor: [Function: mostNumerousColor]
  },
  createNewGame: [Function: createNewGame],
  endTurn: [Function: endTurn],
  getLastPlayedCardReference: [Function: getLastPlayedCardReference],
  getPlayer: [Function: getPlayer],
  isCardFace: [Function: isCardFace],
  isWinner: [Function: isWinner],
  moves: [Module: null prototype] {
    DEAL: 'dealCards',
    DRAW: 'draw',
    FLIP_PLAYED_CARDS_TO_DECK: 'flipPlayedCardsToDeck',
    LEAVE: 'leave',
    PLAY: 'play',
    SHUFFLE: 'shuffleDeck',
    STAY: 'stay',
    dealCards: [Function: dealCards],
    draw: [Function: draw],
    flipPlayedCardsToDeck: [Function: flipPlayedCardsToDeck],
    leave: [Function: leave],
    play: [Function: play],
    shuffleDeck: [Function: shuffleDeck],
    stay: [Function: stay]
  },
  name: 'Prší',
  playerGameCopy: [Function: playerGameCopy],
  shuffleCards: [Function: shuffleCards]
}
```
