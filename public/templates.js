import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header({ game = {}, nah } = {}) {
  return html`
    <header>
      <h1>Nová hra</h1>
      <p>
        Hra ještě nezačala. Čeká se na zapojení dostatečného množství hráčů.
      </p>

      <button class="js-dialog-sound-effects-open" type="button">
        Zvukové efekty
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
} = {}) {
  return html`
    <main>
      <section>
        <h2>Hráči (${game.players?.length || 0})</h2>
        ${!game.players?.length &&
        html`<button class="js-?">Zapojit se do hry</button>`}
        ${players.map(
          (player) => html`
            <figure>
              ${player.name}${userId && player.id === userId && " (to jsi ty)"},
              počet karet: ${player.cards.length}
            </figure>
          `
        )}
        <h2>Stůl</h2>
        <figure>
          Karta na stole:
          <strong>
            ${lastCard ? `${lastCard.value} ${lastCard.color}` : "žádná"}
          </strong>
        </figure>
        <figure>Balíček karet (${game.deck?.length})</figure>
      </section>

      <section>
        <h2>Tvoje možnosti</h2>
        <button @click=${handleGameMove} name="suffle">
          Zamíchat balíček karet
        </button>
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
          ${!userPlayer?.cards.length &&
        html`<option disabled selected>žádné karty v ruce</option>`}
        </select>
        <button @click=${handleGameMove} disabled name="card">
          Táhnout kartu
        </button> -->
        <!-- <button @click=${handleGameMove} disabled name="stay">Stát</button> -->
        <!-- <button @click=${handleGameMove} name="leave">Opustit hru</button> -->
      </section>
    </main>
  `;
}
