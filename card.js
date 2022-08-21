const CARDS = [
  {
    suit: "1",
    value: "blood1",
  },
  {
    suit: "1",
    value: "blood2",
  },
  {
    suit: "1",
    value: "string",
  },
  {
    suit: "1",
    value: "light",
  },
  {
    suit: "2",
    value: "blood1",
  },
  {
    suit: "2",
    value: "blood2",
  },
  {
    suit: "2",
    value: "string",
  },
  {
    suit: "2",
    value: "figure",
  },
  {
    suit: "3",
    value: "blood1",
  },
  {
    suit: "3",
    value: "blood2",
  },
  {
    suit: "3",
    value: "string",
  },
  {
    suit: "3",
    value: "light",
  },
  {
    suit: "4",
    value: "blood1",
  },
  {
    suit: "4",
    value: "blood2",
  },
  {
    suit: "4",
    value: "string",
  },
  {
    suit: "4",
    value: "figure",
  },
  {
    suit: "5",
    value: "blood1",
  },
  {
    suit: "5",
    value: "blood2",
  },
  {
    suit: "5",
    value: "string",
  },
  {
    suit: "5",
    value: "figure",
  },
  {
    suit: "6",
    value: "blood1",
  },
  {
    suit: "6",
    value: "blood2",
  },
  {
    suit: "6",
    value: "string",
  },
  {
    suit: "6",
    value: "figure",
  },
  {
    suit: "7",
    value: "blood1",
  },
  {
    suit: "7",
    value: "blood2",
  },
  {
    suit: "7",
    value: "string",
  },
  {
    suit: "7",
    value: "figure",
  },
  {
    suit: "8",
    value: "blood1",
  },
  {
    suit: "8",
    value: "blood2",
  },
  {
    suit: "8",
    value: "string",
  },
  {
    suit: "8",
    value: "light",
  },
  {
    suit: "9",
    value: "blood1",
  },
  {
    suit: "9",
    value: "blood2",
  },
  {
    suit: "9",
    value: "string",
  },
  {
    suit: "9",
    value: "figure",
  },
  {
    suit: "10",
    value: "blood1",
  },
  {
    suit: "10",
    value: "blood2",
  },
  {
    suit: "10",
    value: "string",
  },
  {
    suit: "10",
    value: "figure",
  },
  {
    suit: "11",
    value: "blood1",
  },
  {
    suit: "11",
    value: "blood2",
  },
  {
    suit: "11",
    value: "double",
  },
  {
    suit: "11",
    value: "light",
  },
  {
    suit: "12",
    value: "double",
  },
  {
    suit: "12",
    value: "string",
  },
  {
    suit: "12",
    value: "figure",
  },
  {
    suit: "12",
    value: "light",
  },
];

class Deck {
  constructor(card) {
    this.CARDS = card;
    this.cardList = [...card];
    // this.cardSize = {
    //   width: imgWidth / 8.0,
    //   height: imgHeight / 6.0,
    // };
  }
  get cardsLength() {
    return this.cardList.length;
  }
  shuffle() {
    const newList = [];
    for (let i = 0; i < this.cardsLength; i++) {
      const newIndex = Math.floor(Math.random() * this.cardsLength);
      if (!newList[newIndex]) {
        newList[newIndex] = this.cardList[i];
        // this.players[i].order = newIndex;
      } else {
        i--;
        continue;
      }
    }
    this.cardList = [...newList];
  }
  draw() {
    const card = this.cardList[this.cardsLength - 1];
    this.cardList.splice(this.cardsLength - 1, 1);
    return card;
  }
  getIndex(card) {
    let index;
    this.CARDS.forEach((el, i) => {
      if (el.suit == card.suit && el.value == card.value) index = i % 4;
    });
    return index;
  }
}

module.exports = { CARDS, Deck };
