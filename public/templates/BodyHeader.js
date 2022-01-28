import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";


const gameStatusToTitle = (status) => {
  switch (status) {
    case 0:
      return "Hra ještě nezačala";
    default:
      return status;
  }
};


export default function BodyHeader({ gameStatus = "", playerName = "", maxPlayers, playersCount} = {}) {

  return html`
    <header>
      <h1>${ gameStatusToTitle(gameStatus)}</h1>
      <!-- <h1>Jarda míchá</h1> -->
      <!-- <h1>Jarda míchá</h1> -->
      <!-- <h1>Pepa táhne</h1> -->
      <!-- <h1>Franta líže dvě karty</h1> -->
      <p>
        U stolu sedí ${playerName} <br /> a ${(playersCount - 1) || "nikdo"} další.
        Maximalní počet hráčů je
        ${maxPlayers}.
      </p>
    </header>
  `;
}
