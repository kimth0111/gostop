const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const webSocket = require("./socket");

dotenv.config(); //env파일
const indexRouter = require("./routes");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(sessionMiddleware);

app.use("/", indexRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "포트에서 대기중");
});

webSocket(server, app, sessionMiddleware);
/*
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

class Board {
  constructor({ players, deck }) {
    this.players = players;
    this.deck = deck;
    this.cardObject = {
      older: [],
      newer: [],
      paired: [],
    };
    this.currentOrder = 0;
    this.order = [];
    this.currentProcess;
  }
  
  giveCardsAtFirst() {
    // 처음에 카드 나눠주기
    this.players.forEach((player) => {
      for (let i = 0; i < 7; i++) {
        this.giveCardsToPlayer(player);
      }
    });
    this.giveCardsToBoard();
  }
  giveCardsToPlayer(player) {
    // 플레이어에게 카드 나눠주기
    const drewCard = this.deck.draw();
    player.addCardToHand(drewCard);
  }
  giveCardsToBoard() {
    // 보드에 카드 깔기
    for (let i = 0; i < 6; i++) {
      this.addCardsToOlder([this.deck.draw()]);
    }
  }
  strike(player) {
    // 플레이어가 패를 내기
    if (player != this.players[this.currentOrder]) return;
    if (player.drewCard) {
      console.log("드로우된 카드를 침");
      this.addCardsToNewer(player.drewCard);
      player.deleteHands(player.drewCard);
      this.givePairedCardToPlayer();
      player.drewCard = null;
      player.selectedCard = null;
    } else if (player.handsLength == 0) {
      this.drawByPlayer();
    } else if (!player.selectedCard) return;
    else {
      this.addCardsToNewer(player.selectedCard);
      player.deleteHands(player.selectedCard);
      this.drawByPlayer();
    }
  }

  addCardsToNewer(card) {
    //newer에 카드 추가
    this.cardObject.newer.push(card);
    this.arrangePairedCard();
  }
  addCardsToOlder(cardList) {
    cardList.forEach((card) => {
      this.cardObject.older.push(card);
    });
  }
  arrangePairedCard() {
    //맞춰진 카드 정리
    this.cardObject.older.forEach((card, i) => {
      this.cardObject.newer.forEach((newCard, j) => {
        if (card.suit == newCard.suit) {
          this.cardObject.paired.push(this.cardObject.older[i]);
          this.cardObject.paired.push(this.cardObject.newer[j]);
          this.cardObject.older.splice(i, 1);
          this.cardObject.newer.splice(j, 1);
          return;
        }
      });
    });
    // console.log("현재 카드리스트: ", { ...this.cardObject });
  }
  drawByPlayer() {
    console.log(this.players[this.currentOrder], "에게 패를 줌");
    // 카드 뽑기(플레이어)
    this.players[this.currentOrder].addDrewCard(this.deck.draw());
  }
  givePairedCardToPlayer() {
    // 맞춰진 카드 player한테 주기
    this.players[this.currentOrder].addPairedCards(this.cardObject.paired);
    this.cardObject.paired = [];
    this.cardObject.newer.forEach((card) => {
      this.cardObject.older.push(card);
    });
    this.cardObject.newer = [];
  }
}

class PLAYER {
  constructor(id) {
    this.id = id;
    this.order = 0;
    this.hands = [];
    this.pairedCard = {
      blood: [],
      double: [],
      figure: [],
      light: [],
      string: [],
    };
    this.drewCard;
    this.selectedCard;
  }
  get handsLength() {
    return this.hands.length;
  }
  setOrder(index) {
    this.order = index;
  }
  deleteHands(card) {
    this.hands.forEach((hand, i) => {
      if (hand === card) {
        this.hands.splice(i, 1);
        return;
      }
    });
    console.log(this.hands);
  }
  addCardToHand(card) {
    this.hands.push(card);
  }
  addDrewCard(card) {
    this.drewCard = card;
    this.selectedCard = card;
    console.log("패에서 ", card, "뽑음");
  }
  addPairedCards(cards) {
    console.log(cards, "받음");
    cards.forEach((card) => {
      this.pairedCard.blood.push(card);
    });
  }
  changeSelectedCard(card) {
    if (this.drewCard) return;
    console.log(card, "로 변경");
    this.selectedCard = card;
  }
}

class DECK {
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

const myPlayer = new PLAYER(1);
const board = new Board({
  players: [myPlayer],
  deck: new DECK(CARDS),
});
board.startGame();

//   const object = {
//     board: {
//       cardObject: {
//         older: [],
//         newer: [],
//         paired: [],
//       },
//       currentOrder: 0,
//       players: [],
//       order: [],
//       currentProcess: "시작",
//     },
//     others: [
//       {
//         id: 1,
//         order: 1,
//         pairedCard: {
//           blood: [],
//           double: [],
//           figure: [],
//           light: [],
//           string: [],
//         },
//       },
//     ],
//     myPlayer: {
//       id: 0,
//       order: 0,
//       hands: [],
//       pairedCard: {
//         blood: [],
//         double: [],
//         figure: [],
//         light: [],
//         string: [],
//       },
//       drewCard: undefined,
//       selectedCard: undefined,
//     },
//     deck: {
//       CARDS: [],
//     },
//   };

function getPlayerById(id, boardObj) {
  boardObj.players.forEach((el) => {
    if (el.id === id) {
      console.log(el);
      return el;
    }
  });
  return;
}
*/
