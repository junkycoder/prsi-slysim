import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export default function TodoList({ foo } = {}) {
  return html`
    <section>
      <h2><em>Zadání</em></h2>
      <label>
        <input type="checkbox" />
        vypsat zakladni informace o hre a jejim stavu
      </label>
      <label>
        <input type="checkbox" />
        vypsat seznam hracu s poctem jejich karet
      </label>
      <label>
        <input type="checkbox" />
        zobrazit odehrane karty (kdyz nejake) a balicek novych karet na stole
      </label>
      <label>
        <input type="checkbox" />
        vypsat seznam hracu s poctem jejich karet a stavem
      </label>
      <label>
        <input type="checkbox" />
        umoznit zamichat karty pokud jsem na tahu a hra jeste nezacala
      </label>
      <label>
        <input type="checkbox" />
        umoznit rozdat karty pokud jsem na tahu a hra jeste nezacala
      </label>
      <label>
        <input type="checkbox" />
        zobrazit moje vlastni karty v ruce
      </label>
      <label>
        <input type="checkbox" />
        umoznit tahnout kartou, pokud jsem na tahu + donutit vzit kartu zpet,
        pokud ji nejde pouzit a tahnout znovu
      </label>
      <label>
        <input type="checkbox" />
        umoznit si liznout, pokud jsem na tahu + donutit liznout vetsi pocet
        pokud jde o penaltu Sedmicka
      </label>
      <label>
        <input type="checkbox" />
        umoznit stat bez liznuti, pokud jde o penaltu Eso
      </label>
      <label><input type="checkbox" /> umoznit opustit hru </label>
    </section>
  `;
}
