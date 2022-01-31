import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import { playerNameStoredLocally } from "/storage.js";

export default function tJoinGame({
  user,
  gameId,
  joining,
  handleJoinGame,
} = {}) {
  return html`
    <header>
      <h1>Zapojte se do hry</h1>
    </header>

    <main>
      <form method="post" @submit=${handleJoinGame}>
        <label>
          <span>Vaše jméno hráče</span>
          <input
            type="text"
            name="player-name"
            value=${playerNameStoredLocally.read()}
            @blur="${({ target: { value } }) => {
              playerNameStoredLocally.write(value);
            }}"
            required
          />
        </label>
        <input type="hidden" name="id" value=${gameId} />
        <button type="submit" ?disabled="{joining}">Odeslat</button>
        <h2>Co bude dál?</h2>
        <p>Po odeslání budete automaticky zapojeni do hry.</p>
        <h2>O jakou hru jde?</h2>
        <p>
          Jedná se o klasické
          <a
            href="https://cs.wikipedia.org/wiki/Pr%C5%A1%C3%AD"
            title="Wikipedie"
          >
            prší </a
          >. Hra je vytvořená primárně pro uživatele se zrakovým handicapem.<br />
          Více informací <a href="/" title="Prší slyšim">zde</a>.
        </p>
      </form>
    </main>
  `;
}
