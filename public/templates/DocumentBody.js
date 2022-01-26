import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import tBodyHeader from "./BodyHeader.js";
import tTodoList from "./TodoList.js";

function gameStatusToTitle(status) {
  switch (status) {
    case 0:
      return "Hra ještě nezačala";
    default:
      return status;
  }
}

export default function DocumentBody({ game = {} } = {}) {
  return html`
    ${tBodyHeader({
      title: gameStatusToTitle(game.status),
    })}
    <main>
      <section>
        <h2>Hráči</h2>
        <figure>Franta – 5 karet</figure>
        <figure>Pepa – 2 karty</figure>
        <figure>Honza – 1 karta</figure>
        <figure>
          <!-- Honza – žádná karta, vyhrál! -->
        </figure>
        <figure>Benjamínek (to jsi ty) – 3 karty</figure>
        <!--  -->
        <h2>Stůl</h2>
        <figure>Zelená sedmička</figure>
        <figure>Balíček karet</figure>
      </section>
      <section>
        <h2>Tvoje možnosti</h2>
        <select name="card" onchange="handleSelectedHandCardChanged(event)">
          <option>Kulová osma</option>
          <option>Zelený spodek</option>
          <option>Červená sedmička</option>
        </select>
        <button disabled name="move">Táhnout kartu</button>
        <button name="draw">Líznout si</button>
        <button disabled name="stay">Stát</button>
        <button name="leave">Vzdát se a opustit hru</button>
      </section>
      <!-- ${tTodoList()} -->
    </main>
  `;
}
