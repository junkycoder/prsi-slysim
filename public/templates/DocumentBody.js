import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import tBodyHeader from "./BodyHeader.js";
import tTodoList from "./TodoList.js";
import tPlayerList from "./PlayerList.js";

const gameStatusToTitle = (status) => {
  switch (status) {
    case 0:
      return "Hra ještě nezačala";
    default:
      return status;
  }
};

const getUserPlayer = (userId, players = []) =>
  players.find((player) => userId && player.id === userId);

const getLastPlayedCard = ({ playedCards = [] }) => playedCards.slice(-1)[0];

export default function DocumentBody({ user, game = {} } = {}) {
  const userPlayer = getUserPlayer(user.id, game.players);
  const lastCard = getLastPlayedCard(game);

  return html`
    ${tBodyHeader({
      title: gameStatusToTitle(game.status),
    })}
    <main>
      <section>
        <h2>Hráči</h2>
        ${tPlayerList({ players: game.players, userId: user?.id })}
        <!--  -->
        <h2>Stůl</h2>
        ${lastCard &&
        html`<figure>${lastCard.value} ${lastCard.color}</figure>`}
        <figure>Balíček karet</figure>
      </section>
      <section>
        <h2>Tvoje možnosti</h2>
        <select name="card" onchange="handleSelectedHandCardChanged(event)">
          ${userPlayer?.cards.map(
            ({ id, value, color }) =>
              html`<option value="${id}">${value} ${color}</option>`
          )}
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
