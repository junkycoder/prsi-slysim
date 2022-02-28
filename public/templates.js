import { html } from "https://unpkg.com/lit-html@2.1.1/lit-html.js?module";

export function header(
  { title = "Hrajte si" } = {},
  { handleShareGame = noop } = {}
) {
  return html`
    <header>
      <h1>${title}</h1>
      <p>
        Hra ještě nezačala. Čeká se na zapojení dostatečného množství hráčů.
      </p>
      <button @click=${handleShareGame}>Sdílet odkaz na hru</button>

      <p>Doporučujeme hrát na klidném místě a se sluchátky na uších.</p>
      <button class="js-dialog-sound-effects-open" type="button">
        Nastavit zvukové efekty
      </button>
    </header>
  `;
}

const noop = () => {};
const getGameUser = (userId, list = []) =>
  list.find((user) => userId && user.id === userId);

export function content(
  { game: { players = [], currentPlayer, ...game } = {}, user } = {},
  {
    handleYourMove = noop,
    handlePlayerCardSelect = noop,
    handleLeaveGame = noop,
  } = {}
) {
  const userPlayer = players.find((player) => player.id === user?.uid);
  const isUserVerified = (user || false) && user.emailVerified;
  const isUserPlaying = Boolean(userPlayer);
  const isPlayersTurn = isUserPlaying && userPlayer.id === currentPlayer.id;
  const [lastCard] = game.playedCards?.slice(-1) || [];

  return html`
    <main>
      <section>
        <h2>Hráči (${players?.length || 0})</h2>
        <p>
          ${
            players.length
              ? `U stolu sedí ${players
                  .slice(0, -1)
                  .map(({ name }) => name)
                  .join(", ")}${
                  players.length > 1
                    ? ` a ${players.slice(-1)[0].name}.`
                    : `${players.slice(-1)[0].name}.`
                }`
              : `U stolu zatím nikdo nesedí.`
          }
        </p>
        ${players.map(
          (player) => html`
            <figure>
              ${player.name}${player.id === currentPlayer.id
                ? " na tahu"
                : ""}${!(userPlayer?.id && player.id === userPlayer.id)
                ? ""
                : " (to jsi ty)"},
              ${player.cards?.length
                ? `počet karet: ${player.cards.length}`
                : "bez karet"}
            </figure>
          `
        )}
        <h2>Stůl</h2>
        <figure>
          ${
            lastCard
              ? `Karta na stole je ${lastCard.value} ${lastCard.color}`
              : "Na stole není vyložená žádná karta."
          }
        </figure>
        <figure>
        ${
          game.deck?.length
            ? `Balíček karet (${game.deck.length}), ${
                game.deckShuffled ? "zamíchaný" : "nezamíchaný"
              }`
            : `Balíček tu ${!lastCard ? "také " : ""} není.`
        }
      </section>

      <section>
        <h2>Tvé možnosti</h2>
        ${
          isUserPlaying
            ? ""
            : html`
                <button
                  ?disabled=${!isUserVerified}
                  class="js-dialog-join-game-open"
                >
                  Zapojit se do hry
                </button>
              `
        }
        ${
          isUserVerified || isUserPlaying
            ? ""
            : html`
                <p>Pro zapojení do hry musíš být ověřený.</p>
                <button class="js-dialog-verify-self-open">Ověřit se</button>
              `
        }
        ${
          !isUserPlaying || game.status
            ? ""
            : html`
                <button
                  @click=${handleYourMove}
                  name="shuffle"
                  ?disabled=${!isPlayersTurn}
                  title=${isPlayersTurn
                    ? "Zamíchat karty"
                    : `Na tahu je ${currentPlayer.name}`}
                >
                  Zamíchat balíček karet
                </button>
                <button
                  @click=${handleYourMove}
                  name="deal"
                  ?disabled=${!isPlayersTurn || !game.deckShuffled || players.length < 2}
                  title=${isPlayersTurn
                    ? !game.deckShuffled
                      ? "Nejprve je potřeba balíček zamíchat"
                      : players.length > 1 ? "Rozdat karty" : "Nedostatek hráčů"
                    : `Na tahu je ${currentPlayer.name}`}
                >
                  Rozdat karty
                </button>
              `
        }
        <!--  -->
        <!-- <button @click=${handleYourMove} disabled name="draw">
          Líznout si
        </button> -->
        <!-- <select name="card" @change=${handlePlayerCardSelect} disabled>
          ${userPlayer?.cards.map(
            ({ id, value, color }) => html`
              <option ?selected=${selectedCard?.id} value="${id}">
                ${value} ${color}
              </option>
            `
          )}
          ${
            !userPlayer?.cards.length &&
            html`<option disabled selected>žádné karty v ruce</option>`
          }
        </select>
        <button @click=${handleYourMove} disabled name="card">
          Táhnout kartu
        </button> -->
        <!-- <button @click=${handleYourMove} disabled name="stay">Stát</button> -->
        <!-- <button @click=${handleYourMove} name="leave" type="button">Vzdát se</button> -->

        <button @click=${handleLeaveGame} type="button">Odejít</button>
      </section>
    </main>
  `;
}
