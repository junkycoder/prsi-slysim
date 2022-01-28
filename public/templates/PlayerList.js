import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
// import { classMap } from "lit-html/directives/class-map.js";

export default function PlayerList({ players = [], userId } = {}) {
  return players.map(
    (player) => html`
      <figure>
        ${player.name}${userId && player.id === userId && " (to jsi ty)"}, počet
        karet: ${player.cards.length}
      </figure>
    `
  );
}
