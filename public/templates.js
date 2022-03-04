import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat?module";

import * as moves from "/library/prsi/moves.js";
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

  // consider to move this shit to the prsi module
  const showDrawCard =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    (cardOnTable?.value !== STAY_CARD_VALUE || game.lastMove?.stood);
  const showCARD_COLORSelect =
    isPlayersTurn && selectedCard?.value === CHANGE_CARD_VALUE;
  const showPlayersCards = game.status === GAME_STATUS.STARTED && isUserPlaying;
  const showFlipPlayedCardsToDeck =
    isPlayersTurn && isUserPlaying && !game.deck.length;
  const showStay =
    game.status === GAME_STATUS.STARTED &&
    isUserPlaying &&
    cardOnTable?.value === STAY_CARD_VALUE &&
    !game.lastMove?.stood;
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
  const canDrawCard = isPlayersTurn && game.deck.length;
  const canPlayCard =
    isPlayersTurn &&
    selectedCard &&
    (cardOnTable.value !== STAY_CARD_VALUE ||
      selectedCard.value === STAY_CARD_VALUE ||
      game.lastMove?.stood);
  const canStay = isPlayersTurn && cardOnTable?.value === STAY_CARD_VALUE;
  const canFlipPlayedCardsToDeck =
    isPlayersTurn && game.playedCards?.length > 2;

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
        <h2>Tvé karty a možnosti</h2>
         ${ifelse(
           showPlayersCards,
           html`
             <div class="flex horizontal-scroll" aria-label="Vaše karty">
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
               showCARD_COLORSelect,
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
                           @click=${handleCardColorSelect}
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
               name=${moves.play.name}
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
              name=${moves.shuffleDeck.name}
              ?disabled=${!canShuffleDeck}
              data-busy-title="Míchám..."
              data-allow-many="true"
              data-n=${game.settings?.dealedCards}
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
              name=${moves.dealCards.name}
              ?disabled=${!canDealCards}
              data-busy-title="Rozdávám..."
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
          showDrawCard,
          html`
            <button
              ?disabled=${!canDrawCard}
              @click=${handleMove}
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
              @click=${handleMove}
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
              @click=${handleMove}
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
