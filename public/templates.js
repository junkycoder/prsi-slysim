import {
  html,
  nothing,
} from "https://unpkg.com/lit-html@2.2.0/lit-html.js?module";

import { repeat } from "https://unpkg.com/lit-html@2.2.0/directives/repeat.js?module";
// import { choosed } from "https://unpkg.com/lit-html@2.2.0/directives/choose.js?module";
import { classMap } from "https://unpkg.com/lit-html@2.2.0/directives/class-map.js?module";

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

export const game_summary_line = ({
  status,
  currentPlayer,
  players,
  outcome,
  deckShuffled,
}) => {
  let line = "";

  if (status === GAME_STATUS.NOT_STARTED) {
    line += `Hra ještě nezačala.`;
  }

  if (status === GAME_STATUS.OVER) {
    line += `Zvítězil ${outcome.winner.name}, je to nejlepší hráč na světě!`;
  } else if (!players?.length) {
    line += ` U stolu nikdo nesedí.`;
  } else {
    line += ` U stolu sedí `;
    line += players
      .slice(0, -1)
      .map(({ name, cards = [] }) => `${name} (${cards.length})`)
      .join(", ");

    const lastPayer = players.slice(-1)[0];

    if (players.length > 1) {
      line += " a ";
    }
    line += `${lastPayer.name} (${lastPayer.cards.length}).`;
  }

  if ((players || []).length < 2) {
    line += ` Čeká se na alespoň jednoho spoluhráče..`;
  }

  if (currentPlayer) {
    if ([GAME_STATUS.OVER, GAME_STATUS.NOT_STARTED].includes(status)) {
      line += ` Karty ${deckShuffled ? "rozdává" : "míchá"} ${
        currentPlayer?.name
      }.`;
    } else line += ` Na tahu je ${currentPlayer?.name}.`;
  } else {
    ("Zapojte se jako první hráč, budete míchat a rozdávát.");
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

export const table_card_line = ({ card, color }) => {
  let line = `${card?.value}–${card?.color}`;
  line = `Na stole je ${line}`;

  if (card?.value === CHANGE_CARD_VALUE) {
    line += ` a mění na ${color}`;
  }

  line += ".";
  return line;
};

const getCardImageURL = ({ id } = {}) => {
  if (!id) return ""; // reversed card img
  return `/assets/${id.normalize("NFKD").replace(/[^\w]/g, "")}.jpeg`;
};
const getColorImageURL = (color) => {
  if (!color) return "";
  return `/assets/${color.normalize("NFKD").replace(/[^\w]/g, "")}.png`;
};

export function content(
  { game = {}, user, selectedCard, selectedColor, busy } = {},
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
  const isUserSigned = (user || false);
  const isUserPlaying = Boolean(userPlayer);
  const isPlayersTurn = isUserPlaying && userPlayer.id === currentPlayer.id;
  const [cardOnTable] = game.playedCards?.slice(-1) || [];

  if (game.status === undefined) {
    return nothing;
  }

  // consider to move this shit to the prsi module
  const showDraw =
    isPlayersTurn &&
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    (cardOnTable?.value !== STAY_CARD_VALUE || cardOnTable.cold);
  const showCardColorSelect = selectedCard?.value === CHANGE_CARD_VALUE;
  const showPlayersCards = game.status === GAME_STATUS.STARTED && isUserPlaying;
  const showFlipPlayedCardsToDeck =
    game.status === GAME_STATUS.STARTED && isPlayersTurn && game.deck.length < game.drawCount;
  const showStay =
    game.status === GAME_STATUS.STARTED &&
    isPlayersTurn &&
    cardOnTable?.value === STAY_CARD_VALUE &&
    cardOnTable.cold !== true;
  const showShuffleDeck =
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status) &&
    isPlayersTurn &&
    busy !== DEAL_MOVE;
  const showDealCards =
    game.status === GAME_STATUS.NOT_STARTED &&
    isPlayersTurn &&
    game.deckShuffled;
  const showVerfySelf = !isUserSigned && !isUserPlaying;
  const showJoinGame = !isUserPlaying;

  const canJoinGame =
    isUserSigned &&
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canShuffleDeck =
    isPlayersTurn &&
    [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canDealCards = isPlayersTurn && game.deckShuffled && players.length > 1;
  const canDraw = isPlayersTurn && game.deck.length >= game.drawCount;
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
        ${ifelse(
          cardOnTable,
          html`
            <div class="card-on-table">
              <img
                class="card-on-table__card"
                src="${getCardImageURL(cardOnTable)}"
                aria-label="${table_card_line({
                  card: cardOnTable,
                  color: game.currentColor,
                })}"
              />
              ${ifelse(
                cardOnTable?.value === CHANGE_CARD_VALUE,
                html`<img
                  aria-hidden="true"
                  class="card-on-table__color"
                  src="${getColorImageURL(game.currentColor)}"
                />`
              )}
            </div>
          `,
          html`<p>Na stole není vyložená žádná karta.</p> `
        )}
      </section>

      <section>
        <h2>Ve tvých rukách</h2>
        ${ifelse(
          showPlayersCards,
          html`
            <div class="hands">
              ${repeat(
                userPlayer?.cards,
                ({ id }) => id,
                ({ id, value, color }) => html`
                  <label class="hands__item hands__item--card">
                    <input
                      ?checked=${id === selectedCard?.id}
                      type="radio"
                      value="${id}"
                      name="card"
                      @change=${handlePlayerCardSelect}
                    />
                    <img
                      class="${classMap({
                        "card-in-hands": true,
                        "card-in-hands--selected": id === selectedCard?.id,
                      })}"
                      src="${getCardImageURL({ id })}"
                      alt="${value} ${color}"
                      aria-label="${value} ${color}"
                    />
                  </label>
                `
              )}
            </div>
            ${ifelse(
              showCardColorSelect,
              html`
                <div class="hands" aria-label="Změna barvy">
                  ${CARD_COLORS.map(
                    (color) => html`
                      <label class="hands__item hands__item--color">
                        <input
                          ?checked=${color === selectedCard?.color}
                          type="radio"
                          value="${color}"
                          name="color"
                          @change=${handleCardColorSelect}
                        />
                        <img
                          class="${classMap({
                            "color-in-hands": true,
                            "color-in-hands--selected": color === selectedColor,
                          })}"
                          src="${getColorImageURL(color)}"
                          alt="${color}"
                          aria-label="${color}"
                        />
                      </label>
                    `
                  )}
                </div>
              `
            )}
            <button
              @click=${handleMove}
              ?disabled=${!canPlayCard || busy === PLAY_MOVE}
              name=${PLAY_MOVE}
            >
              ${ifelse(
                selectedCard,
                ifelse(
                  selectedCard?.value === CHANGE_CARD_VALUE,
                  `Táhnout ${selectedCard?.value}–${selectedCard?.color} a změnit barvu na ${selectedColor}`,
                  `Táhnout ${selectedCard?.value}–${selectedCard?.color}`
                ),
                "Před tahem vyberte kartu"
              )}
            </button>
          `
        )}
        ${ifelse(
          showJoinGame,
          html`
            <button
              ?disabled=${!canJoinGame}
              class="js-dialog-join-game-open"
              title=${ifelse(
                game.status,
                "Hra již probíhá",
                unless(isUserSigned, "Nejprve se potřebujete přihlásit.")
              )}
              type=${ifelse(
                game.status === GAME_STATUS.STARTED,
                "button",
                "submit"
              )}
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
              html`<p>Pro zapojení do hry musíš být přihlášený.</p>`
            )}
            <button class="js-dialog-verify-self-open">Přihlásit se e-mailem</button>
            <button class="js-anonyme-self">Přihlásit se anonymně</button>
          `
        )}
        ${ifelse(
          showDealCards,
          html`
            <button
              @click=${handleMove}
              name=${DEAL_MOVE}
              ?disabled=${!canDealCards ||
              [DEAL_MOVE, SHUFFLE_MOVE].includes(busy)}
              data-n=${players.length * (game.settings?.dealCards / 2 || 1)}
              aria-label=${ifelse(
                players.length > 1,
                "Rozdat karty",
                "Rozdat karty nejde, nedostatek hráčů"
              )}
            >
              ${ifelse(busy === DEAL_MOVE, "Rozdávám", "Rozdat karty")}
            </button>
          `
        )}
        ${ifelse(
          showShuffleDeck,
          html`
            <button
              @click=${handleMove}
              name=${SHUFFLE_MOVE}
              ?disabled=${!canShuffleDeck || busy === SHUFFLE_MOVE}
            >
              ${ifelse(
                isPlayersTurn,
                ifelse(
                  busy === SHUFFLE_MOVE,
                  "Míchám",
                  "Zamíchat balíček karet"
                ),
                `Balíček míchá ${currentPlayer?.name}`
              )}
              ${ifelse(
                game.status === GAME_STATUS.OVER,
                html`<br />(začít novou hru)`
              )}
            </button>
          `
        )}
        ${ifelse(
          showDraw,
          html`
            <button
              ?disabled=${!canDraw || busy === DRAW_MOVE}
              @click=${handleMove}
              name=${DRAW_MOVE}
              data-n=${game.drawCount || 1}
              title=${ifelse(
                game.deck?.length < game.drawCount,
                "Nedostatek karet v balíčku",
                `V balíčku je ${game.deck.length} karet`
              )}
            >
              ${ifelse(
                busy === DRAW_MOVE,
                "Lížu",
                `Líznout si ${
                  game.drawCount > 1 ? game.drawCount + "krát" : ""
                }`
              )}
            </button>
          `
        )}
        ${ifelse(
          showStay,
          html`
            <button
              ?disabled=${!canStay || busy === STAY_MOVE}
              @click=${handleMove}
              name=${STAY_MOVE}
            >
              ${ifelse(busy === STAY_MOVE, "Stojím", "Stát")}
            </button>
          `
        )}
        ${ifelse(
          showFlipPlayedCardsToDeck,
          html`
            <button
              ?disabled=${!canFlipPlayedCardsToDeck ||
              busy === FLIP_PLAYED_CARDS_TO_DECK_MOVE}
              @click=${handleMove}
              name=${FLIP_PLAYED_CARDS_TO_DECK_MOVE}
            >
              ${ifelse(
                busy === FLIP_PLAYED_CARDS_TO_DECK_MOVE,
                "Otáčím",
                "Otočit odehrané karty"
              )}
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
    message += ` si ${drawn}krát líznul`;
  } else if (card) {
    message += ` táhnul ${card.value} ${card.color}`;
    if (card.value === CHANGE_CARD_VALUE) {
      message += ` a změnil barvu na ${game.currentColor}`;
    }
  } else if (type === STAY_MOVE) {
    message += " stojí";
  }

  if (game.status === GAME_STATUS.OVER && game.outcome) {
    message += ` a vyhrává!`;
  } else if (user && game.currentPlayer.id === user.uid) {
    message += ". Jsi na tahu.";
  } else {
    message += `.`;
  }
  return message;
}
