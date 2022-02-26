import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header({
  // user,
  // game = {},
  // sounds,
  // music,
  // selectedCard,
  // handleSoundsClick,
  // handleMusicClick,
  // handleGameMove,
  // handleShareGame,
  // handlePlayerCardSelect,
  // handleReloadPage,
  nah,
} = {}) {
  // const userPlayer = getGameUser(user.uid, game.players);
  // const userSpectator = getGameUser(user.uid, game.spectators);
  // const lastCard = getLastPlayedCard(game);

  // const loaded = !isNaN(game.status);

  return html`
    <header>
      <h1>Nová hra</h1>
      <p>
        Hra ještě nezačala. Čeká se na zapojení dostatečného množství hráčů.
      </p>
    </header>
  `;
}

export function content({ foo = "" } = {}) {
  return html`<main><em>${foo}</em></main>`;
}
