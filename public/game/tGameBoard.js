import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import tTodoList from "./tTodoList.js";
import tPlayerList from "./tPlayerList.js";

const gameStatusToTitle = (status) => {
  switch (status) {
    case 0:
      return "Hra ještě nezačala";
    default:
      return "Zatím nejsou data";
  }
};

const getGameUser = (userId, list = []) =>
  list.find((user) => userId && user.id === userId);

const getLastPlayedCard = ({ playedCards = [] }) => playedCards.slice(-1)[0];

export default function tGameBoard({
  user,
  game = {},
  sounds,
  music,
  selectedCard,
  handleSoundsClick,
  handleMusicClick,
  handleGameMove,
  handleShareGame,
  handlePlayerCardSelect,
  handleReloadPage,
} = {}) {
  const userPlayer = getGameUser(user.uid, game.players);
  const userSpectator = getGameUser(user.uid, game.spectators);
  const lastCard = getLastPlayedCard(game);

  const loaded = !isNaN(game.status);

  return html`
    <header>
      <h1>${gameStatusToTitle(game.status)}</h1>
      <p>
        ${loaded
          ? html` ${userPlayer &&
              html`U stolu sedí ${userPlayer?.name} a
              ${game.players?.length - 1 || "nikdo"} další.`}
              ${userSpectator &&
              html`${userSpectator?.name} se ke stolu nevešel.`}
              <br />Maximalní počet hráčů je ${game.settings?.maxPlayers}.
              ${game.spectators?.length &&
              html`<br />Celkový počet přislouchajících:
                ${game.spectators.length}.`}`
          : "Zde se zobrazí základní informace vytvořené hře. Pokud tomu tak nebude, zkuste načíst stránku znovu."}
      </p>
      <p>
        ${!loaded
          ? html`<a href="#" @click=${handleReloadPage}
              >Znovu načíst stránku</a
            >`
          : html`<a href="#" @click=${handleShareGame}>Sdílet odkaz na hru</a>`}
      </p>
      <p>
        Zvukové efekty jsou
        <strong>${sounds ? "zapnuté" : "vypnuté"}</strong> (<a
          href="#"
          @click=${handleSoundsClick}
          >${!sounds ? "zapnout" : "vypnout"}</a
        >), déšť na pozadí je
        <strong>${music ? "zapnutý" : "vypnutý"}</strong> (<a
          href="#"
          @click=${handleMusicClick}
          >${!music ? "zapnout" : "vypnout"}</a
        >).
      </p>
    </header>

    <main>
      <section>
        <h2>Hráči (${game.players?.length || 0})</h2>
        ${tPlayerList({ players: game.players, userId: user?.id })}
        <!--  -->
        <h2>Stůl</h2>
        <figure>
          Karta na stole:
          <strong>
            ${lastCard ? `${lastCard.value} ${lastCard.color}` : "žádná"}
          </strong>
        </figure>
        <figure>Balíček karet (${game.deck?.length})</figure>
      </section>
      ${loaded &&
      html`
        <section>
          <h2>Tvoje možnosti</h2>
          <button
            @click=${handleGameMove}
            name="suffle"
            ?disabled=${game.moving || game.currentPlayer.id !== userPlayer?.id}
          >
            Zamíchat balíček karet
          </button>
          <button @click=${handleGameMove} disabled name="deal">
            Rozdat karty
          </button>
          <button @click=${handleGameMove} disabled name="draw">
            Líznout si
          </button>
          <select name="card" @change=${handlePlayerCardSelect} disabled>
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
          </button>
          <button @click=${handleGameMove} disabled name="stay">Stát</button>
          <button @click=${handleGameMove} name="leave">Opustit hru</button>
        </section>
      `}
      <!-- ${tTodoList()} -->
    </main>
  `;
}
