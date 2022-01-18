import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export default function BodyHeader({ title = "" } = {}) {

  return html`
    <header>
      <h1>${title}</h1>
      <!-- <h1>Jarda míchá</h1> -->
      <!-- <h1>Jarda míchá</h1> -->
      <!-- <h1>Pepa táhne</h1> -->
      <!-- <h1>Franta líže dvě karty</h1> -->
      <p>
        Místnost založil Jarda před deseti minutama. Maximalní počet hráčů je
        šest. U stolu sedí dva hráči.
      </p>
    </header>
  `;
}
