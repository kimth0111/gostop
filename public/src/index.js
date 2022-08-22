const socket = io.connect("https://damp-earth-02842.herokuapp.com/game", {
  path: "/socket.io",
});
socket.on("complete", () => {
  socket.emit("get", {});
});
socket.on("join", (data) => {
  console.log(data.id + "님이 입장하셨습니다.");
});
socket.on("exit", (data) => {
  console.log(data.id + "님이 퇴장하셨습니다.");
});
function start() {
  socket.emit("startGame");
}
socket.on("start", () => {
  socket.emit("getFirst");
});
socket.on("sendFirst", (data) => {
  console.log("hi");
  init(data);
});
socket.on("send", (data) => {
  console.log("데이터를 받음");
  arrangeData(data);
});
let myPlayer;
let board;
function init(data) {
  console.log(data);
  const newPlayers = [];
  data.others.forEach((other) => {
    newPlayers.push(new PLAYER(other.id));
  });

  myPlayer = new PLAYER(data.myPlayer.id);
  newPlayers.push(myPlayer);

  board = new Board({ players: newPlayers, deck: new DECK() });
  console.log(board);
  arrangeData(data);
  // setInterval(draw, 50);
}
document.querySelector("form").addEventListener("submit", (el) => {
  el.preventDefault();
  if (myPlayer.hands[el.target.number.value])
    sendEventToServer("changeSelectedCard", {
      change: { index: el.target.number.value },
    });
});

document.querySelector("button").addEventListener("click", () => {
  sendEventToServer("strike", {});
});

// init();
class Board {
  constructor({ players, deck }) {
    this.cvObject = {
      board: {
        position: {
          x: 4,
          y: 35,
        },
        size: 1.2,
      },
      player: {
        hands: {
          position: {
            x: 3,
            y: 76,
          },
          size: 2,
        },
        paired: {
          blood: {
            position: {
              x: 17,
              y: 58,
            },
            size: 0.8,
          },
          double: {
            position: {
              x: 25,
              y: 58,
            },
            size: 0.8,
          },
          figure: {
            position: {
              x: 13,
              y: 58,
            },
            size: 0.8,
          },
          string: {
            position: {
              x: 5,
              y: 58,
            },
            size: 0.8,
          },
          light: {
            position: {
              x: 1,
              y: 58,
            },
            size: 0.8,
          },
        },
        selected: {
          position: {
            x: 13,
            y: 60,
          },
          size: 1.6,
        },
      },
    };
    this.players = players;
    this.cardObject = {
      older: [],
      newer: [],
      paired: [],
    };
    this.currentOrder = 0;
    this.order = []; //순서 영어 찾기
    this.currentProcess;
    this.deck = deck;
  }
  get playerLength() {
    return this.players.length;
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
}

class DECK {
  constructor() {
    this.CARDS = {};
  }
  get cardsLength() {
    return this.cardList.length;
  }
  getIndex(card) {
    let index;
    this.CARDS.forEach((el, i) => {
      if (el.suit == card.suit && el.value == card.value) index = i % 4;
    });
    return index;
  }
}

const canvas = document.querySelector("#main-canvas");
const ctx = canvas.getContext("2d");
const cardBackImg = new Image();
cardBackImg.src = "/cardBack.jpg";
const backgroundImg = new Image();
backgroundImg.src = "/board.png";
const cardImg = new Image();
cardImg.src = "/card.png";
const imgWidth = cardImg.width;
const imgHeight = cardImg.height;

function drawBackground() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.clearRect(
    20,
    canvas.height * 0.7,
    canvas.width - 40,
    canvas.height * 0.3 - 20
  );
  ctx.clearRect(
    canvas.width * 0.07,
    canvas.height * 0.3,
    canvas.width * 0.86,
    canvas.height * 0.23
  );
  ctx.drawImage(
    cardBackImg,
    canvas.width * 0.1,
    canvas.height * 0.325,
    cardBackImg.width * 0.7,
    cardBackImg.height * 0.7
  );
  ctx.clearRect(
    30,
    canvas.height * 0.55,
    canvas.width - 60,
    canvas.height * 0.15
  );
}

let cardPostions = [];

canvas.addEventListener("click", (e) => {
  const { pointX, pointY } = { pointX: e.offsetX, pointY: e.offsetY };

  if (pointY <= canvas.height * 0.6) {
    console.log("침!");
    sendEventToServer("strike", {});
    return;
  }
  console.log(cardPostions);
  cardPostions.forEach((card, index) => {
    const { x, y, width, height } = { ...card };
    if (
      x <= pointX &&
      x + width >= pointX &&
      y <= pointY &&
      y + height >= pointY
    ) {
      console.log("hihih");
      if (myPlayer.hands[index]) {
        console.log("hihihi", index);
        sendEventToServer("changeSelectedCard", {
          change: { index },
        });
      }
    }
  });
});

function drawCard(card, position = { x: 0, y: 0 }, mg = 1, left = 0, type) {
  const size = mg * 0.5;
  const index = 3 - board.deck.getIndex(card);

  const startX = ((Number(card.suit) - 1) % 2) * 4 + index;
  const startY = Math.ceil(Number(card.suit) / 2) - 1;

  const positionObj = {
    x: ((position.x * imgWidth) / 8.0) * size - left,
    y: position.y * 0.01 * canvas.height,
    width: (imgWidth / 8.0) * size,
    height: (imgHeight / 6) * size,
  };
  if (type === "hands") cardPostions[cardPostions.length] = { ...positionObj };
  const { x, y, width, height } = { ...positionObj };

  if (type === "board") {
    console.log("hihi", positionObj, card);
  }
  ctx.drawImage(
    cardImg,
    (imgWidth / 8.0) * startX,
    startY * (imgHeight / 6),
    imgWidth / 8.0,
    imgHeight / 6,
    x,
    y,
    width,
    height
  );
}
cardImg.onload = function () {
  // draw();
};
function draw() {
  cardPostions = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { older, newer, paired } = { ...board.cardObject };
  const handCards = myPlayer;
  const deckList = board.deck.cardList;

  drawBackground();

  const cardList = [].concat(older, newer, paired);
  cardList.forEach((card, index) => {
    drawCard(
      card,
      {
        x: board.cvObject.board.position.x + index,
        y: board.cvObject.board.position.y,
      },
      board.cvObject.board.size
    );
  });
  ["blood", "string", "light", "double", "figure"].forEach((el) => {
    myPlayer.pairedCard[el].forEach((card, index) => {
      drawCard(
        card,
        {
          x: board.cvObject.player.paired[el].position.x + index,
          y: board.cvObject.player.paired[el].position.y,
        },
        board.cvObject.player.paired[el].size,
        25 * index,
        "board"
      );
    });
  });
  myPlayer.hands.forEach((card, index) => {
    drawCard(
      card,
      {
        x: board.cvObject.player.hands.position.x + index,
        y: board.cvObject.player.hands.position.y,
      },
      board.cvObject.player.hands.size,
      0,
      "hands"
    );
  });
  if (myPlayer.selectedCard)
    drawCard(
      myPlayer.selectedCard,
      {
        x: board.cvObject.player.selected.position.x,
        y: board.cvObject.player.selected.position.y,
      },
      board.cvObject.player.selected.size
    );
}

function sendEventToServer(name, data) {
  data.name = name;
  socket.emit("event", data);
}

function getDataFromeServer(object) {
  arrangeData(object);
}

function arrangeData(object) {
  if(!object)
     return;
  const newMyPlayer = object.myPlayer;
  const newOthers = object.others;
  const newBoard = object.board;
  const newDeck = object.deck;

  for (let key in newBoard) {
    board[key] = newBoard[key];
  }
  newOthers.forEach((el) => {
    for (let key in el) {
      if (getPlayerById(el.id, board))
        getPlayerById(el.id, board)[key] = el[key];
    }
  });
  for (let key in newMyPlayer) {
    myPlayer[key] = newMyPlayer[key];
  }

  board.deck.CARDS = newDeck.CARDS;

  draw();
}

function getPlayerById(id, boardObj) {
  boardObj.players.forEach((el) => {
    if (el.id === id) {
      console.log(el);
      return el;
    }
  });
  return;
}
