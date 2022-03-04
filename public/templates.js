import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import * as moves from "/library/prsi/moves.js";
import {
  cardColors,
  changeColorCardValue,
  stayCardValue,
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
    line += `Je ${game.turn}. kolo.`;
    if (game.status === GAME_STATUS.OVER) {
      line += ` Zvítězil ${game.outcome.winner.name}, je to nejlepší hráč na světě!`;
    }
  }

  return line;
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

const ifelse = (condition, then = "", elze = "") => (condition ? then : elze);
const unless = (negacondition, then = "") => ifelse(!negacondition, then);

export const players_summary_line = ({ players = [] }) => {
  if (!players.length) {
    return `U stolu zatím nikdo nesedí.`;
  }

  let line = `U stolu sedí `;

  line += players
    .slice(0, -1)
    .map(({ name }) => name)
    .join(", ");

  if (players.length > 1) {
    line += ` a ${players.slice(-1)[0].name}.`;
  } else {
    line += `${players.slice(-1)[0].name}.`;
  }

  return line;
};

export const player_line = ({ player, userPlayer, currentPlayer }) => {
  let line = player.name;
  if (userPlayer?.id && player.id === userPlayer.id) {
    line += " (to jsi ty)";
  }
  if (player.id === currentPlayer.id) {
    line += " je na tahu";
  }
  if (player.cards?.length) {
    line += `, karet: ${player.cards.length}`;
  }
  if (line === player.name) return "";
  return line;
};

export const table_card_line = ({ card, color }) => {
  let line = `${card?.value}–${card?.color}`;
  line = `Na stole je ${line}`;

  if (card?.value === changeColorCardValue) {
    line += ` a mění barvu na ${color}`;
  }

  // if (game.playedCards?.length - 1) {
  //   line += `+ ${game.playedCards-1.length} odehraných`
  // }
  return line;
};

export function content(
  { game = {}, user, selectedCard, selectedColor } = {},
  {
    handleYourMove = noop,
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

  // consider to move this shit to the prsi module
  const showDrawCard =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    (cardOnTable?.value !== stayCardValue || game.lastMove?.stood);
  const showCardColorSelect =
    (isPlayersTurn && selectedCard?.value === changeColorCardValue);
  const showPlayersCards = game.status === GAME_STATUS.STARTED && isUserPlaying;
  const showFlipPlayedCardsToDeck =
    isPlayersTurn && isUserPlaying && !game.deck.length;
  const showStay =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    cardOnTable?.value === stayCardValue &&
    !game.lastMove?.stood;
  const showShuffleDeck = isUserPlaying && [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const showVerfySelf = !isUserVerified && !isUserPlaying;
  const showJoinGame = !isUserPlaying;

  const canJoinGame = isUserVerified && [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canShuffleDeck = isPlayersTurn && [GAME_STATUS.NOT_STARTED, GAME_STATUS.OVER].includes(game.status);
  const canDealCards = isPlayersTurn && game.deckShuffled && players.length > 1;
  const canDrawCard = isPlayersTurn && game.deck.length;
  const canPlayCard =
    isPlayersTurn &&
    selectedCard &&
    (cardOnTable.value !== stayCardValue ||
      selectedCard.value === stayCardValue ||
      game.lastMove?.stood);
  const canStay = isPlayersTurn && cardOnTable?.value === stayCardValue;
  const canFlipPlayedCardsToDeck =
    isPlayersTurn && game.playedCards?.length < 2;

  return html`
    <main>
      <section>
        <h2>${`Hráči (${players?.length || 0})`}</h2>
        <p>${players_summary_line(game)}</p>
        ${players.map(
          (player) => html`
            <figure>
              ${player_line({ player, userPlayer, currentPlayer })}
            </figure>
          `
        )}
        <h2>Stůl</h2>
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
        <h2>Tvé možnosti</h2>
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
              @click=${handleYourMove}
              name=${moves.shuffleDeck.name}
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
              @click=${handleYourMove}
              name=${moves.dealCards.name}
              ?disabled=${!canDealCards}
              data-busy-title="Rozdávám..."
              aria-label=${ifelse(
                isPlayersTurn,
                ifelse(
                  !game.deckShuffled,
                  "Rozdat karty vnejde, nejprve je potřeba balíček zamíchat",
                  ifelse(players.length > 1, "Rozdat karty", "Rozdat karty nejde, nedostatek hráčů")
                ),
                `Na tahu je ${currentPlayer?.name}`
              )}
            >
              Rozdat karty
            </button>
          `
        )}
        ${ifelse(
          showDrawCard,
          html`
            <button
              ?disabled=${!canDrawCard}
              @click=${handleYourMove}
              name=${moves.draw.name}
              data-n=${game.drawCardsCount}
              data-busy-title="Lížu..."
              aria-label=${ifelse(
                isPlayersTurn,
                unless(game.deck?.length, "Líznout si, balíček je prázdný"),
                `Líznout si nejde, na tahu je ${currentPlayer?.name}`
              )}
            >
              ${`Líznout si ${game.drawCardsCount}`}
            </button>
          `
        )}
        ${ifelse(
          showStay,
          html`
            <button
              ?disabled=${!canStay}
              @click=${handleYourMove}
              name=${moves.stay.name}
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
              @click=${handleYourMove}
              name=${moves.flipPlayedCardsToDeck.name}
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
        ${ifelse(
          showPlayersCards,
          html`
            <select
              name="card"
              @change=${handlePlayerCardSelect}
              aria-label="Vaše karty"
            >
              ${userPlayer?.cards.map(
                ({ id, value, color }) => html`
                  <option ?selected=${selectedCard?.id} value="${id}">
                    ${value}–${color}
                  </option>
                `
              )}
              <option disabled selected>
                ${ifelse(
                  !userPlayer?.cards.length,
                  "žádné karty v ruce",
                  "Zvolte kartu"
                )}
              </option>
            </select>
            ${ifelse(
              showCardColorSelect,
              html`
                <select
                  name="color"
                  @change=${handleCardColorSelect}
                  aria-label="Změna barvy"
                >
                  ${cardColors.map(
                    (color) => html`
                      <option ?selected=${color === selectedCard?.color}>
                        ${color}
                      </option>
                    `
                  )}
                </select>
              `
            )}
            <button
              @click=${handleYourMove}
              ?disabled=${!canPlayCard}
              name=${moves.play.name}
              data-busy-title="Táhnu..."
              aria-label=${ifelse(
                isPlayersTurn,
                ifelse(
                  selectedCard,
                  "Hrát kartu",
                  "Nejprve je potřeba vybrat kartu"
                ),
                `Na tahu je ${currentPlayer?.name}`
              )}
            >
              Táhnout kartu
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
        html`<p>Doporučujeme hrát na klidném místě a se sluchátky na uších.</p>`
      )}
      <button class="js-dialog-sound-effects-open" type="button">
        Nastavit zvukové efekty
      </button>
        <button @click=${handleLeaveGame} type="button">Odejít</button>
      </section>
    </main>
  `;
}
