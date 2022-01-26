
import * as moves from "./moves.js";


export function autoplay(game) {
  const { playedCards,  currentPlayer: player } = game;
  const lastPlayedCard = playedCards[playedCards.length - 1];

  if (!game.deck.length) {
    moves.flipPlayedCardsToDeck(game, player);
  }

  const sameValueCards = player.cards.filter(
    ({ value }) => value === lastPlayedCard.value
  );

  const sameColorCards = player.cards.filter(
    ({ color }) => color === (game.currentColor || lastPlayedCard.color)
  );

  let cardToPlay;

  if (sameValueCards.length) {
    const [firstCard] = sameValueCards;
    cardToPlay = firstCard;
  }

  if (sameColorCards.length) {
    const [firstCard] = sameColorCards;
    cardToPlay = firstCard;
  }

  if (cardToPlay) {
    if (cardToPlay.value === "svršek") {
      moves.play(game, player, cardToPlay, {
        color: mostNumerousColor(player.cards),
      });
    } else {
      moves.play(game, player, cardToPlay);
    }
  } else {
    moves.draw(game, player);
  }
}

export function mostNumerousColor(cards) {
  const colors = cards.map(({ color }) => color);
  const colorCount = colors.reduce((acc, color) => {
    acc[color] = acc[color] ? acc[color] + 1 : 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(colorCount));

  return Object.keys(colorCount).find(
    (color) => colorCount[color] === maxCount
  );
}
