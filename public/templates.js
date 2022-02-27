import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header({ game = {}, nah } = {}) {
  return html`
    <header>
      <h1>Nová hra</h1>
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

export function content({
  game = {},
  players = [],
  userPlayer = undefined,
  lastCard = null,
  handleGameMove = noop,
  handlePlayerCardSelect = noop,
  handleLeaveGame = noop,
} = {}) {
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
              : `U stolu zatím níkdo nesedí.`
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
            ? `Balíček karet` // TODO: Show howmany cards left but not exactly
            : `Balíček tu ${!lastCard ? "také " : ""} není.`
        }
      </section>

      <section>
        <h2>Tvé možnosti</h2>
        <button class="js-dialog-join-game">Zapojit se do hry</button>
        <!-- <button @click=${handleGameMove} name="suffle">
          Zamíchat balíček karet
        </button> -->
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
