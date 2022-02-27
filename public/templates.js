import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header({ title = "Hrajte si" } = {}) {
  return html`
    <header>
      <h1>${title}</h1>
      <p>
        Hra ještě nezačala. Čeká se na zapojení dostatečného množství hráčů.
      </p>
      <button class="js-dialog-share-game-open">Sdílet odkaz na hru</button>

      <p>Doporučujeme hrát na klidném místě a se sluchátky na uších.</p>
      <button class="js-dialog-sound-effects-open" type="button">
        Nastavit zvukové efekty
      </button>
    </header>
  `;
}

const noop = () => {};

export function content(
  { game: { players = [], ...game } = {}, lastCard = null, user } = {},
  {
    handleGameMove = noop,
    handlePlayerCardSelect = noop,
    handleLeaveGame = noop,
  } = {}
) {
  const userPlayer = players.find((player) => player.id === user?.uid);
  const isUserVerified = (user || false) && user.emailVerified;
  const isUserPlaying = Boolean(userPlayer);
  const isPlayersTurn =
    isUserPlaying && userPlayer.id === game.currentPlayer.id;

  console.info({ isUserVerified, isUserPlaying, isPlayersTurn }, userPlayer);

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
                    : `${players.slice(-1)[0].name} sám.`
                }`
              : `U stolu zatím nikdo nesedí.`
          }
        </p>
        ${players.map(
          (player) => html`
            <figure>
              ${player.name}${userPlayer?.id &&
              player.id === userPlayer.id &&
              " (to jsi ty)"},
              ${player.cards?.length
                ? `počet karet: ${player.cards.length}`
                : "bez karet"}
            </figure>
          `
        )}
        <h2>Stůl</h2>
        <figure>
          ${
            lastCard
              ? `Karta na stole je ${lastCard.value} ${lastCard.color}`
              : "Na stole není vyložená žádná karta."
          }
        </figure>
        <figure>
        ${
          game.deck?.length
            ? `Balíček karet (${game.deck.length})` // TODO: Show howmany cards left but not exactly
            : `Balíček tu ${!lastCard ? "také " : ""} není.`
        }
      </section>

      <section>
        <h2>Tvé možnosti</h2>
        ${
          isUserPlaying
            ? ""
            : html`
                <button
                  ?disabled=${!isUserVerified}
                  class="js-dialog-join-game-open"
                >
                  Zapojit se do hry
                </button>
              `
        }
        ${
          isUserVerified || isUserPlaying
            ? ""
            : html`
                <p>Pro zapojení do hry musíš být ověřený.</p>
                <button class="js-dialog-verify-self-open">Ověřit se</button>
              `
        }
        ${
          !isUserPlaying
            ? ""
            : html`
                <button
                  @click=${handleGameMove}
                  name="suffle"
                  ?disabled=${!isPlayersTurn}
                  title=${isPlayersTurn
                    ? "Zamíchat karty"
                    : `Na tahu je ${game.currentPlayer.name}`}
                >
                  Zamíchat balíček karet
                </button>
              `
        }
        <!-- <button @click=${handleGameMove} disabled name="deal">
          Rozdat karty
        </button> -->
        <!-- <button @click=${handleGameMove} disabled name="draw">
          Líznout si
        </button> -->
        <!-- <select name="card" @change=${handlePlayerCardSelect} disabled>
          ${userPlayer?.cards.map(
            ({ id, value, color }) => html`
              <option ?selected=${selectedCard?.id} value="${id}">
                ${value} ${color}
              </option>
            `
          )}
          ${
            !userPlayer?.cards.length &&
            html`<option disabled selected>žádné karty v ruce</option>`
          }
        </select>
        <button @click=${handleGameMove} disabled name="card">
          Táhnout kartu
        </button> -->
        <!-- <button @click=${handleGameMove} disabled name="stay">Stát</button> -->
        <!-- <button @click=${handleGameMove} name="leave" type="button">Vzdát se</button> -->

        <button @click=${handleLeaveGame} type="button">Odejít</button>
      </section>
    </main>
  `;
}
