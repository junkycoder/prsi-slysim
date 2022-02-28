import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header({ game = {}, title = "Hrajte si" } = {}) {
  return html`
    <header>
      <h1>${title}</h1>
      <p>
        ${!game.status
          ? `Hra ještě nezačala. ${
              (game.players || []).length < 2
                ? "Čeká se na zapojení dostatečného množství hráčů."
                : ""
            }`
          : html`Hra probíhá. Na tahu je
              <strong>${game.currentPlayer?.name}</strong>.`}
      </p>
    </header>
  `;
}

const noop = () => {};

// const getGameUser = (userId, list = []) =>
//  list.find((user) => userId && user.id === userId);

const ifelse = (condition, then = "", elze = "") => (condition ? then : elze);
const unless = (negacondition, then = "") => ifelse(!negacondition, then);

export function content(
  {
    game: { players = [], currentPlayer, ...game } = {},
    user,
    selectedCard,
    selectedColor,
  } = {},
  {
    handleYourMove = noop,
    handlePlayerCardSelect = noop,
    handleLeaveGame = noop,
    handleShareGame = noop,
  } = {}
) {
  const userPlayer = players.find((player) => player.id === user?.uid);
  const isUserVerified = (user || false) && user.emailVerified;
  const isUserPlaying = Boolean(userPlayer);
  const isPlayersTurn = isUserPlaying && userPlayer.id === currentPlayer.id;
  const [lastCard] = game.playedCards?.slice(-1) || [];

  return html`
    <main>
      <section>
        <h2>Hráči (${players?.length || 0})</h2>
        <p>
          ${
            players.length
              ? `U stolu sedí ${players
                  .slice(0, -1)
                  .map(({ name }) => name)
                  .join(", ")}${
                  players.length > 1
                    ? ` a ${players.slice(-1)[0].name}.`
                    : `${players.slice(-1)[0].name}.`
                }`
              : `U stolu zatím nikdo nesedí.`
          }
        </p>
        ${players.map(
          (player) => html`
            <figure>
              ${player.name}${!(userPlayer?.id && player.id === userPlayer.id)
                ? ""
                : " (to jsi ty)"}${player.id === currentPlayer.id
                ? ", je na tahu"
                : ""},
              ${player.cards?.length
                ? `počet karet: ${player.cards.length}`
                : "bez karet"}
            </figure>
          `
        )}
        <h2>Stůl</h2>
        <figure>
          ${ifelse(
            lastCard,
            html`
              Na stole je
              <strong>${lastCard?.value}–${lastCard?.color}</strong>.
              ${!(game.playedCards?.length - 1)
                ? ""
                : `Odehraných karet celkem: ${game.playedCards.length}`}
            `,
            "Na stole není vyložená žádná karta."
          )}
        </figure>
        <figure>
        ${ifelse(
          game.deck?.length,
          `Balíček karet (${game.deck?.length}) ${
            game.deckShuffled ? "" : "není zamíchaný"
          }`,
          `Balíček tu ${!lastCard ? "také " : ""} není.`
        )}
      </section>

      <section>
        <h2>Tvé možnosti</h2>
        ${unless(
          isUserPlaying,
          html`
            <button
              ?disabled=${!isUserVerified}
              class="js-dialog-join-game-open"
            >
              Zapojit se do hry
            </button>
          `
        )}
        ${unless(
          isUserVerified || isUserPlaying,
          html`
            <p>Pro zapojení do hry musíš být ověřený.</p>
            <button class="js-dialog-verify-self-open">Ověřit se</button>
          `
        )}
        ${unless(
          !isUserPlaying || game.status,
          html`
            <button
              @click=${handleYourMove}
              name="shuffle"
              ?disabled=${!isPlayersTurn}
              title=${isPlayersTurn
                ? "Zamíchat karty"
                : `Na tahu je ${currentPlayer?.name}`}
            >
              Zamíchat balíček karet
            </button>
            <button
              @click=${handleYourMove}
              name="deal"
              ?disabled=${!isPlayersTurn ||
              !game.deckShuffled ||
              players.length < 2}
              data-sound-effect="deal-cards.wav"
              data-busy-title="Lížu..."
              title=${isPlayersTurn
                ? !game.deckShuffled
                  ? "Nejprve je potřeba balíček zamíchat"
                  : players.length > 1
                  ? "Rozdat karty"
                  : "Nedostatek hráčů"
                : `Na tahu je ${currentPlayer?.name}`}
            >
              Rozdat karty
            </button>
          `
        )}
        ${unless(
          !game.status,
          html`
            <button
              ?disabled=${!isPlayersTurn || !game.deck.length}
              @click=${handleYourMove}
              name="draw"
              data-sound-effect="draw.wav"
              data-busy-title="Lížu..."
              title=${isPlayersTurn
                ? game.deck.length
                  ? ""
                  : "Balíček je prázdný"
                : `Na tahu je ${currentPlayer?.name}`}
            >
              Líznout si
            </button>
          `
        )}
        ${unless(
          !game.status || game.deck.length,
          html`
            <button
              ?disabled=${!isPlayersTurn || game.playedCards.length < 2}
              @click=${handleYourMove}
              name="flip"
              data-sound-effect="deck.wav"
              data-busy-title="Otáčím..."
              title=${isPlayersTurn
                ? game.playedCards.length > 1
                  ? ""
                  : "Nejsou odehrané žádné karty"
                : `Na tahu je ${currentPlayer?.name}`}
            >
              Otočit odehrané karty
            </button>
          `
        )}
        ${unless(
          !game.status,
          html`
            <select name="card" @change=${handlePlayerCardSelect}>
              ${userPlayer?.cards.map(
                ({ id, value, color }) => html`
                  <option ?selected=${selectedCard?.id} value="${id}">
                    ${value}–${color}
                  </option>
                `
              )}
              <option disabled selected>
                ${!userPlayer?.cards.length
                  ? "žádné karty v ruce"
                  : "Zvolte kartu"}
              </option>
            </select>
            <button
              @click=${handleYourMove}
              ?disabled=${!isPlayersTurn || !selectedCard}
              name="play"
              data-sound-effect="play-card.wav"
              data-busy-title="Táhnu..."
              title=${isPlayersTurn
                ? selectedCard
                  ? "Hrát kartu"
                  : "Nejprve je potřeba vybrat kartu"
                : `Na tahu je ${currentPlayer?.name}`}
            >
              Táhnout kartu
            </button>
          `
        )}
        <!-- <button @click=${handleYourMove} disabled name="stay">Stát</button> -->
        <!-- <button @click=${handleYourMove} name="leave" type="button">Vzdát se</button> -->

      <button
        @click=${handleShareGame}
        type=${game.status ? "button" : "submit"}
      >
        Sdílet odkaz na hru
      </button>

      ${
        !game.status
          ? html`<p>
              Doporučujeme hrát na klidném místě a se sluchátky na uších.
            </p>`
          : ""
      }
      <button class="js-dialog-sound-effects-open" type="button">
        Nastavit zvukové efekty
      </button>
        <button @click=${handleLeaveGame} type="button">Odejít</button>
      </section>
    </main>
  `;
}
