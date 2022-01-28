import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";
import { classMap } from "lit-html/directives/class-map.js";

export default function Example({ foo = "Example" } = {}) {
  return html`
    <div
      class="${classMap({
        example: true,
        "example--foo": foo === "foo",
      })}
    "
    >
      <h1>${foo}</h1>
    </div>
  `;
}
