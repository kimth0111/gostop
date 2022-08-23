const { getPlayerById } = require("./game");

class Board {
  constructor({ deck, room }) {
    this.deck = deck;
    this.cardObject = {
      older: [],
      newer: [],
      paired: [],
      choosing: [],
    };
    this.room = room;
    this.currentOrder = 0;
    this.order = [];
    this.currentProcess = "ready";
    this.PROCESS = ["playing", "ready", "choosing"];
  }

  get players() {
    return this.room.players;
  }
  get playerLength() {
    return this.players.length;
  }
  changeProcess(process) {
    if (this.PROCESS.includes(process)) {
      this.currentProcess = process;
    }
  }
  start() {
    this.deck.shuffle();
    this.setOrder();
    this.giveCardsAtFirst();
    this.changeProcess("playing");
  }
  setOrder() {
    //차례 정하기
    for (let i = 0; i < this.playerLength; i++) {
      const newIndex = Math.floor(Math.random() * this.playerLength);
      if (!this.order[newIndex]) {
        this.order[newIndex] = this.players[i].id;
        // this.players[i].order = newIndex;
        this.players[i].setOrder(newIndex);
      } else {
        i--;
        continue;
      }
    }
  }
  changeOrder() {
    console.log("순서 바뀌었습니다!!!!!!!");
    if (this.cardObject.choosing.length >= 1) {
      console.log("순서 ㄴㄴ");
      return;
    }
    if (this.playerLength - 1 <= this.currentOrder) {
      this.currentOrder = 0;
      return;
    }
    this.currentOrder = this.currentOrder + 1;
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
    if (player.order != this.currentOrder) return;
    if (player.drewCard) {
      console.log("드로우된 카드를 침");
      this.addCardsToNewer(player.drewCard);
      player.deleteHands(player.drewCard);
      player.drewCard = null;
      player.selectedCard = null;
      if (this.cardObject.choosing.length >= 1) {
        this.changeProcess("choosing");
      } else {
        this.arrangePairedCard();
        this.givePairedCardToPlayer();
        this.changeOrder();
      }
    } else if (player.handsLength == 0) {
      this.drawByPlayer(player.id);
    } else if (!player.selectedCard) return;
    else {
      this.addCardsToNewer(player.selectedCard);
      player.deleteHands(player.selectedCard);
      this.drawByPlayer(player.id);
    }
  }

  getToSendData() {
    return {
      cardObject: this.cardObject,
      currentOrder: this.currentOrder,
      currentProcess: this.currentProcess,
      order: this.order,
    };
  }
  addCardsToNewer(card) {
    //newer에 카드 추가
    this.cardObject.newer.push(card);
  }
  addCardsToOlder(cardList) {
    cardList.forEach((card) => {
      this.cardObject.older.push(card);
    });
  }
  chooseCard(data) {
    const index = data.choose.index;
    console.log("hihihi", this.cardObject.choosing, data);
    this.cardObject.paired = this.cardObject.paired.concat(
      this.cardObject.choosing[0][0],
      this.cardObject.choosing[0][index + 1]
    );
    const otherIndex = index == 0 ? 1 : 0;
    this.cardObject.older.push(this.cardObject.choosing[0][otherIndex + 1]);
    this.cardObject.choosing.splice(0, 1);
    this.givePairedCardToPlayer();
  }
  arrangePairedCard() {
    let result = [];
    if (
      this.cardObject.newer.length >= 2 &&
      this.cardObject.newer[0].suit == this.cardObject.newer[1].suit
    ) {
      result.push(this.cardObject.newer[0]);
      result.push(this.cardObject.newer[1]);
      for (let i = 0; i < this.cardObject.older.length; i++) {
        const card = this.cardObject.older[i];
        if (card.suit == this.cardObject.newer[0].suit) {
          result.push(card);
          this.cardObject.older.splice(i, 1);
          i--;
        }
      }
      if (result.length == 2) {
        //쪽
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else if (result.length == 3) {
        //쌈
        this.cardObject.older = this.cardObject.older.concat([...result]);
      } else if (result.length == 4) {
        //따닥
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      }
      this.cardObject.newer = [];

      console.log("결과2", result);
    } else if (this.cardObject.newer.length >= 2) {
      result.push(this.cardObject.newer[0]);
      //맞춰진 카드 정리
      for (let i = 0; i < this.cardObject.older.length; i++) {
        const card = this.cardObject.older[i];
        if (card.suit == this.cardObject.newer[0].suit) {
          result.push(card);
          this.cardObject.older.splice(i, 1);
          i--;
        }
      }

      if (result.length == 2) {
        console.log("하나 맞춤");
        //하나
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else if (result.length == 3) {
        console.log("두개중 골라");
        //두개
        this.cardObject.choosing.push(result);
        this.changeProcess("choosing");
      } else if (result.length == 4) {
        //세개
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else {
        this.cardObject.older = this.cardObject.older.concat([...result]);
      }

      console.log("결과", result);
      result = [];
      result.push(this.cardObject.newer[1]);
      //맞춰진 카드 정리
      for (let i = 0; i < this.cardObject.older.length; i++) {
        const card = this.cardObject.older[i];
        if (card.suit == this.cardObject.newer[1].suit) {
          result.push(card);
          this.cardObject.older.splice(i, 1);
          i--;
        }
      }
      if (result.length == 2) {
        //쪽
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else if (result.length == 3) {
        //쌈
        this.cardObject.choosing.push([...result]);
        this.changeProcess("choosing");
      } else if (result.length == 4) {
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else {
        this.cardObject.older = this.cardObject.older.concat([...result]);
      }
      console.log("결과", result);
    } else {
      result.push(this.cardObject.newer[0]);
      //맞춰진 카드 정리
      for (let i = 0; i < this.cardObject.older.length; i++) {
        const card = this.cardObject.older[i];
        if (card.suit == this.cardObject.newer[0].suit) {
          result.push(card);
          this.cardObject.older.splice(i, 1);
          i--;
        }
      }
      if (result.length == 2) {
        //쪽
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else if (result.length == 3) {
        //쌈
        this.cardObject.choosing.push(result);
        this.changeProcess("choosing");
      } else if (result.length == 4) {
        this.cardObject.paired = this.cardObject.paired.concat([...result]);
      } else {
        this.cardObject.older = this.cardObject.older.concat([...result]);
      }
      result = [];
    }
    this.cardObject.newer = [];
    console.log("현재 카드리스트: ", { ...this.cardObject });
    // console.log("현재 카드리스트: ", { ...this.cardObject });
  }
  drawByPlayer(playerId) {
    // console.log(this.room.getPlayerById(playerId), "에게 패를 줌");
    this.room.getPlayerById(playerId).addDrewCard(this.deck.draw());
  }
  givePairedCardToPlayer() {
    // 맞춰진 카드 player한테 주기
    this.room
      .getPlayerById(this.order[this.currentOrder])
      .addPairedCards(this.cardObject.paired);
    this.cardObject.paired = [];
    this.cardObject.newer.forEach((card) => {
      this.cardObject.older.push(card);
    });
    this.cardObject.newer = [];
  }
}

module.exports = Board;
