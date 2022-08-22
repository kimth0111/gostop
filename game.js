const Board = require("./board");
const { Deck, CARDS } = require("./card");

const rooms = [];

class ROOM {
  constructor({ title, max, id }) {
    this.title = title;
    this.max = max;
    this.id = id;
    this.players = [];
    this.board;
  }
  get playerLength() {
    return this.players.length;
  }
  init() {
    this.board = new Board({ deck: new Deck(CARDS), room: this });
  }
  start() {
    if (this.playerLength >= 2) {
      this.board.start();
      return true;
    }
  }
  addPlayer(player) {
    if (this.playerLength < this.max) {
      this.players.push(player);
    }
    // console.log(`${player.id}가 들어와서`, this.players);
  }
  deletePlayer(id) {
    this.players.forEach((el, index) => {
      if (el.id == id) this.players.splice(index, 1);
    });
    // console.log(id, "가 나가서", this.players);
    if (this.playerLength < 2) this.endGame();
  }
  getPlayerById(id) {
    let result;
    this.players.forEach((player) => {
      if (player.id == id) result = player;
    });
    return result;
  }
  getToSendData(id) {
    const process = this.board.currentProcess;
    let result = {};
    try {
      result = { others: [], deck: { CARDS: this.board.deck.CARDS } };
      const ownPlayer = this.getPlayerById(id);

      this.players.forEach((player) => {
        if (player.id != id) {
          result.others.push(player.getOtherData());
        } else {
          result.myPlayer = ownPlayer.getOwnData();
        }
      });

      result.board = this.board.getToSendData();

      this.room = {
        title: this.title,
        id: this.id,
      };
    } catch (err) {
      return false;
    }

    return result;
  }
  endGame() {
    this.init();
  }
  event(data) {
    switch (data.name) {
      case "changeSelectedCard":
        // console.log(data);
        if (data.change) {
          if (data.change.index != undefined) {
            console.log(data.playerId + "가 패를 들었습니다");
            this.getPlayerById(data.playerId).changeSelectedCard(
              data.change.index
            );
          }
        } else return;
        break;
      case "strike":
        if (this.board && this.getPlayerById(data.playerId))
          this.board.strike(this.getPlayerById(data.playerId));
        else return;
        break;
    }
    return true;
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
  getOtherData() {
    return {
      id: this.id,
      order: this.order,
      pairedCard: this.pairedCard,
    };
  }
  getOwnData() {
    return {
      id: this.id,
      order: this.order,
      hands: this.hands,
      pairedCard: this.pairedCard,
      drewCard: this.drewCard,
      selectedCard: this.selectedCard,
    };
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
    // console.log(this.hands);
  }
  addCardToHand(card) {
    this.hands.push(card);
  }
  addDrewCard(card) {
    console.log("패를바바바");
    this.drewCard = card;
    this.selectedCard = card;
    // console.log("패에서 ", card, "뽑음");
  }
  addPairedCards(cards) {
    // console.log(cards, "받음");
    cards.forEach((card) => {
      this.pairedCard[card.value.replace("1", "").replace("2", "")].push(card);
    });
  }
  changeSelectedCard(index) {
    const card = this.hands[index];
    if (this.drewCard) return;
    this.selectedCard = card;
  }
}

let newId = 0;

function getRooms() {
  return rooms;
}
function createNewRoom(object) {
  // console.log(object);
  const newRoom = new ROOM({
    title: object.title,
    max: object.max,
    id: newId,
  });
  rooms.push(newRoom);
  newId++;
  newRoom.init();
  return newRoom;
}

function getRoomById(id) {
  let result;
  rooms.forEach((room) => {
    if (room.id == id) {
      result = room;
    }
  });
  return result;
}

function deleteRoomById(id) {
  rooms.forEach((room, index) => {
    if (room.id == id) {
      rooms.splice(index, 1);
    }
  });
}
function joinRoom({ playerId, roomId }) {
  // console.log(getRoomById(roomId));
  if (getRoomById(roomId)) getRoomById(roomId).addPlayer(new PLAYER(playerId));
}
function exitRoom({ playerId, roomId }) {
  if (getRoomById(roomId)) getRoomById(roomId).deletePlayer(playerId);
}

module.exports = { getRooms, createNewRoom, getRoomById, joinRoom, exitRoom };
