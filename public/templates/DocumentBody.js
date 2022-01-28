import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import tBodyHeader from "./BodyHeader.js";
import tTodoList from "./TodoList.js";
import tPlayerList from "./PlayerList.js";

const getUserPlayer = (userId, players = []) =>
  players.find((player) => userId && player.id === userId);

const getLastPlayedCard = ({ playedCards = [] }) => playedCards.slice(-1)[0];

export default function DocumentBody({ user, game = {} } = {}) {
  const userPlayer = getUserPlayer(user.uid, game.players);
  const lastCard = getLastPlayedCard(game);

  return html`
    ${tBodyHeader({
      gameStatus: game.status,
      playerName: userPlayer?.name,
      maxPlayers: game.settings?.maxPlayers,
      playersCount: game.players?.length,
    })}
    <main>
      <section>
        <h2>Hráči</h2>
        ${tPlayerList({ players: game.players, userId: user?.id })}
        <!--  -->
        <h2>Stůl</h2>
        ${lastCard &&
        html`<figure>${lastCard.value} ${lastCard.color}</figure>`}
        <figure>Balíček karet (${game.deck?.length})</figure>
      </section>
      <section>
        <h2>Tvoje možnosti</h2>
        <select name="card" onchange="handleSelectedHandCardChanged(event)" disabled>
          ${userPlayer?.cards.map(
            ({ id, value, color }) =>
              html`<option value="${id}">${value} ${color}</option>`
          )}
          ${!userPlayer?.cards.length && html`<option disabled selected>žádné karty v ruce</option>`}
        </select>
        <button name="suffle">Zamíchat karty</button>
        <button disabled name="deal">Rozdat karty</button>
        <button disabled name="move">Táhnout kartu</button>
        <button disabled name="draw">Líznout si</button>
        <button disabled name="stay">Stát</button>
        <button name="leave">Vzdát se a opustit hru</button>
      </section>
      <!-- ${tTodoList()} -->
    </main>
  `;
}
