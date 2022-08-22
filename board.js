class Board {
  constructor({ deck, room }) {
    this.deck = deck;
    this.cardObject = {
      older: [],
      newer: [],
      paired: [],
    };
    this.room = room;
    this.currentOrder = 0;
    this.order = [];
    this.currentProcess = "ready";
    this.PROCESS = ["playing", "ready"];
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
    if (player != this.players[this.currentOrder]) return;
    if (player.drewCard) {
      console.log("드로우된 카드를 침");
      this.addCardsToNewer(player.drewCard);
      player.deleteHands(player.drewCard);
      this.givePairedCardToPlayer();
      player.drewCard = null;
      player.selectedCard = null;
      this.changeOrder();
    } else if (player.handsLength == 0) {
      this.drawByPlayer();
    } else if (!player.selectedCard) return;
    else {
      this.addCardsToNewer(player.selectedCard);
      player.deleteHands(player.selectedCard);
      this.drawByPlayer();
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

module.exports = Board;
