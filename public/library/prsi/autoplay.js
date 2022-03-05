import * as moves from "./moves.js";
import {
  DRAW_CARD_VALUE,
  STAY_CARD_VALUE,
  CHANGE_CARD_VALUE,
} from "./index.js";

export function autoplay(game) {
  const { playedCards, currentPlayer: player } = game;
  const lastPlayedCard = playedCards[playedCards.length - 1];

  const sameValueCards = player.cards.filter(
    ({ value }) => value === lastPlayedCard.value
  );

  const sameColorCards = player.cards.filter(
    ({ color }) => color === (game.currentColor || lastPlayedCard.color)
  );

  let cardToPlay;

  if (
    lastPlayedCard.value === DRAW_CARD_VALUE &&
    lastPlayedCard.cold !== true
  ) {
    cardToPlay = sameValueCards.find(({ value }) => value === DRAW_CARD_VALUE);
  } else if (
    lastPlayedCard.value === STAY_CARD_VALUE &&
    lastPlayedCard.cold !== true
  ) {
    cardToPlay = sameValueCards.find(({ value }) => value === STAY_CARD_VALUE);
  } else if (sameValueCards.length) {
    const [firstCard] = sameValueCards;
    cardToPlay = firstCard;
  } else if (sameColorCards.length) {
    const [firstCard] = sameColorCards;
    cardToPlay = firstCard;
  }

  if (cardToPlay) {
    if (cardToPlay.value === CHANGE_CARD_VALUE) {
      moves.play(game, player, cardToPlay, mostNumerousColor(player.cards));
    } else {
      moves.play(game, player, cardToPlay);
    }
  } else if (
    lastPlayedCard.value === STAY_CARD_VALUE &&
    lastPlayedCard.cold !== true
  ) {
    moves.stay(game, player);
  } else {
    if (game.drawCount > game.deck.length) {
      moves.flipPlayedCardsToDeck(game, player);
    }
    moves.draw(game, player);
  }

  if (game.turn > 666) {
    throw new Error("Too many turns");
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
