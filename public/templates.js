import {
  html,
  nothing,
} from "https://unpkg.com/lit-html@2.2.0/lit-html.js?module";

import { repeat } from "https://unpkg.com/lit-html@2.2.0/directives/repeat.js?module";
// import { choosed } from "https://unpkg.com/lit-html@2.2.0/directives/choose.js?module";

import {
  SHUFFLE as SHUFFLE_MOVE,
  DEAL as DEAL_MOVE,
  STAY as STAY_MOVE,
  DRAW as DRAW_MOVE,
  PLAY as PLAY_MOVE,
  FLIP_PLAYED_CARDS_TO_DECK as FLIP_PLAYED_CARDS_TO_DECK_MOVE,
} from "/library/prsi/moves.js";

import {
  CARD_COLORS,
  CHANGE_CARD_VALUE,
  STAY_CARD_VALUE,
  GAME_STATUS,
} from "/library/prsi/index.js";

export const game_title_line = (game) => {
  if (game.status === GAME_STATUS.OVER) {
    return "Konec hry";
  }
  return game.status ? "Hra probíhá" : "Nová hra";
};

export const game_summary_line = (game) => {
  let line = "";

  if (!game.status) {
    line += `Hra ještě nezačala.`;
    if ((game.players || []).length < 2) {
      line += ` Čeká se na alespoň jednoho spoluhráče..`;
    }
  } else {
    if (game.status === GAME_STATUS.OVER) {
      line += `Zvítězil ${game.outcome.winner.name}, je to nejlepší hráč na světě!`;
    }
    if (game.outcome) {
      line += ` Je ${game.turn}. kolo.`;
    }
  }

  return line || nothing;
};

export function header({ game = {} } = {}) {
  return html`
    <header>
      <h1>${game_title_line(game)}</h1>
      <p>${game_summary_line(game)}</p>
    </header>
  `;
}

const noop = () => {};

const ifelse = (condition, then, elze = nothing) => (condition ? then : elze);
const unless = (negacondition, then) => ifelse(!negacondition, then);

export const players_summary_line = ({ currentPlayer, players = [] }) => {
  if (!players.length) {
    return `U stolu zatím nikdo nesedí.`;
  }

  let line = `U stolu sedí `;

  line += players
    .slice(0, -1)
    .map(({ name, cards }) =>
      !cards.length ? name : `${name} (${cards.length})`
    )
    .join(", ");

  const lastPayer = players.slice(-1)[0];

  if (players.length > 1) {
    line += " a ";
  }

  line += !lastPayer.cards.length
    ? `${lastPayer.name}.`
    : `${lastPayer.name} (${lastPayer.cards.length}).`;

  if (currentPlayer) {
    line += ` Na tahu je ${currentPlayer.name}.`;
  }

  return line;
};

export const table_card_line = ({ card, color }) => {
  let line = `${card?.value}–${card?.color}`;
  line = `Na stole je ${line}`;

  if (card?.value === CHANGE_CARD_VALUE) {
    line += ` a mění na ${color}`;
  }

  // if (game.playedCards?.length - 1) {
  //   line += `+ ${game.playedCards-1.length} odehraných`
  // }
  return line;
};

export function content(
  { game = {}, user, selectedCard, selectedColor } = {},
  {
    handleMove = noop,
    handlePlayerCardSelect = noop,
    handleCardColorSelect = noop,
    handleLeaveGame = noop,
    handleShareGame = noop,
  } = {}
) {
  const { players = [], currentPlayer } = game;
  const userPlayer = players.find((player) => player.id === user?.uid);
  const isUserVerified = (user || false) && user.emailVerified;
  const isUserPlaying = Boolean(userPlayer);
  const isPlayersTurn = isUserPlaying && userPlayer.id === currentPlayer.id;
  const [cardOnTable] = game.playedCards?.slice(-1) || [];

  if (game.status === undefined) {
    return nothing;
  }

  // consider to move this shit to the prsi module
  const showDraw =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    (cardOnTable?.value !== STAY_CARD_VALUE || cardOnTable.cold);
  const showCardColorSelect =
    isPlayersTurn && selectedCard?.value === CHANGE_CARD_VALUE;
  const showPlayersCards = game.status === GAME_STATUS.STARTED && isUserPlaying;
  const showFlipPlayedCardsToDeck =
    isPlayersTurn && isUserPlaying && !game.deck.length;
  const showStay =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    cardOnTable?.value === STAY_CARD_VALUE &&
    cardOnTable.cold !== true;
  const showShuffleDeck =
    isUserPlaying &&
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const showVerfySelf = !isUserVerified && !isUserPlaying;
  const showJoinGame = !isUserPlaying;

  const canJoinGame =
    isUserVerified &&
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canShuffleDeck =
    isPlayersTurn &&
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canDealCards = isPlayersTurn && game.deckShuffled && players.length > 1;
  const canDraw = isPlayersTurn && game.deck.length > 0;
  const canPlayCard =
    isPlayersTurn &&
    selectedCard &&
    (cardOnTable.value !== STAY_CARD_VALUE ||
      selectedCard.value === STAY_CARD_VALUE ||
      cardOnTable.cold);
  const canStay = isPlayersTurn && cardOnTable?.value === STAY_CARD_VALUE;
  const canFlipPlayedCardsToDeck = isPlayersTurn;

  return html`
    <main>
      <section>
        <p>${players_summary_line(game)}</p>
        <figure>
          ${ifelse(
            cardOnTable,
            table_card_line({ card: cardOnTable, color: game.currentColor }),
            "Na stole není vyložená žádná karta."
          )}
        </figure>
        <figure>
        ${ifelse(
          game.deck?.length,
          `Balíček karet (${game.deck?.length}) ${
            game.deckShuffled ? "" : "není zamíchaný"
          }`,
          `Balíček tu ${!cardOnTable ? "také " : ""} není.`
        )}
      </section>

      <section>
        <h2>Ve tvých rukách</h2>
        ${ifelse(
          showPlayersCards,
          html`
            <div class="flex horizontal-scroll">
              ${repeat(
                userPlayer?.cards,
                ({ id }) => id,
                ({ id, value, color }) => html`
                  <label class="flex">
                    <input
                      ?checked=${id === selectedCard?.id}
                      type="radio"
                      value="${id}"
                      name="play"
                      @change=${handlePlayerCardSelect}
                    />
                    ${`${value}–${color}`}
                  </label>
                `
              )}
            </div>
            ${ifelse(
              showCardColorSelect,
              html`
                <div class="flex horizontal-scroll" aria-label="Změna barvy">
                  ${CARD_COLORS.map(
                    (color) => html`
                      <label class="flex">
                        <input
                          ?checked=${color === selectedCard?.color}
                          type="radio"
                          value="${color}"
                          name="color"
                          @change=${handleCardColorSelect}
                        />
                        ${color}
                      </label>
                    `
                  )}
                </div>
              `
            )}
            <button
              @click=${handleMove}
              ?disabled=${!canPlayCard}
              name=${PLAY_MOVE}
              data-busy-title="Táhnu..."
              aria-label=${ifelse(
                isPlayersTurn,
                ifelse(
                  selectedCard,
                  `Táhnout ${selectedCard?.value}–${selectedCard?.color}`,
                  "Před tahem vyberte kartu"
                ),
                `Táhnout kartu nelze, na tahu je ${currentPlayer?.name}`
              )}
            >
              Táhnout kartu
            </button>
          `
        )}
        ${ifelse(
          showJoinGame,
          html`
            <button
              ?disabled=${!canJoinGame}
              class="js-dialog-join-game-open"
              aria-label=${ifelse(
                game.status,
                "Hra již probíhá",
                unless(isUserVerified, "Nejprve se potřebujete ověřit")
              )}
              type=${ifelse(game.status, "button", "submit")}
            >
              Zapojit se do hry
            </button>
          `
        )}
        ${ifelse(
          showVerfySelf,
          html`
            ${unless(
              game.status,
              html`<p>Pro zapojení do hry musíš být ověřený.</p>`
            )}
            <button class="js-dialog-verify-self-open">Ověřit se</button>
          `
        )}
        ${ifelse(
          showShuffleDeck,
          html`
            <button
              @click=${handleMove}
              name=${SHUFFLE_MOVE}
              ?disabled=${!canShuffleDeck}
              data-busy-title="Míchám..."
              data-allow-many="true"
              aria-label=${ifelse(
                isPlayersTurn,
                "Zamíchat karty",
                `Zamíchat balíček karet nejde, na tahu je ${currentPlayer?.name}`
              )}
            >
              Zamíchat balíček karet
            </button>
            <button
              @click=${handleMove}
              name=${DEAL_MOVE}
              ?disabled=${!canDealCards}
              data-busy-title="Rozdávám..."
              data-n=${players.length * (game.settings?.dealCards / 2 || 1)}
              aria-label=${ifelse(
                isPlayersTurn,
                ifelse(
                  !game.deckShuffled,
                  "Rozdat karty vnejde, nejprve je potřeba balíček zamíchat",
                  ifelse(
                    players.length > 1,
                    "Rozdat karty",
                    "Rozdat karty nejde, nedostatek hráčů"
                  )
                ),
                `Na tahu je ${currentPlayer?.name}`
              )}
            >
              Rozdat karty
            </button>
          `
        )}
        ${ifelse(
          showDraw,
          html`
            <button
              ?disabled=${!canDraw}
              @click=${handleMove}
              name=${DRAW_MOVE}
              data-busy-title="Lížu..."
              data-n=${game.drawCount || 1}
              aria-label=${ifelse(
                isPlayersTurn,
                unless(game.deck?.length, "Líznout si, balíček je prázdný"),
                `Líznout si nejde, na tahu je ${currentPlayer?.name}`
              )}
            >
              ${`Líznout si`}
            </button>
          `
        )}
        ${ifelse(
          showStay,
          html`
            <button
              ?disabled=${!canStay}
              @click=${handleMove}
              name=${STAY_MOVE}
              data-busy-title="Stojím..."
              aria-label=${unless(
                isPlayersTurn,
                `Stát nejde, na tahu je ${currentPlayer?.name}`
              )}
            >
              Stát
            </button>
          `
        )}
        ${ifelse(
          showFlipPlayedCardsToDeck,
          html`
            <button
              ?disabled=${!canFlipPlayedCardsToDeck}
              @click=${handleMove}
              name=${FLIP_PLAYED_CARDS_TO_DECK_MOVE}
              data-busy-title="Otáčím..."
              aria-label=${ifelse(
                isPlayersTurn,
                unless(
                  game.playedCards?.length > 1,
                  "Otočit odehrané karty nejde, nejsou odehrané žádné karty"
                ),
                `Otočit odehrané karty nejde, na tahu je ${currentPlayer?.name}`
              )}
            >
              Otočit odehrané karty
            </button>
          `
        )}
        <button
          @click=${handleShareGame}
          type=${game.status ? "button" : "submit"}
        >
          Sdílet odkaz na hru
        </button>

        ${unless(
          game.status,
          html`<p>
            Doporučujeme hrát na klidném místě a se sluchátky na uších.
          </p>`
        )}
        <button class="js-dialog-sound-effects-open" type="button">
          Nastavit zvukové efekty
        </button>
        <button @click=${handleLeaveGame} type="button">Odejít</button>
      </section>
    </main>
  `;
}

export function moveMessage(game, user) {
  const { type, player, drawn, card } = game.lastMove;
  const playerName = player.name || player.id;

  let message = "";

  message = `${playerName}`;

  if (drawn) {
    message += ` si ${drawn}krát líznul.`;
  } else if (card) {
    message += ` táhnul ${card.value} ${card.color}`;
    if (card.value === CHANGE_CARD_VALUE) {
      message += ` a změnil barvu na ${game.currentColor}`;
    }
    message += `.`;
  } else if (type === STAY_MOVE) {
    message += " stojí.";
  }

  if (game.currentPlayer.id === user.uid) {
    message += " Jsi na tahu.";
  }

  return message;
}
