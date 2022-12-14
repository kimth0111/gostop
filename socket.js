const { default: axios } = require("axios");
const { session } = require("passport");
const SocketIO = require("socket.io");
const { joinRoom, exitRoom, getRoomById, deleteRoomById } = require("./game");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  const room = io.of("/room");
  const game = io.of("/game");

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on("connection", (socket) => {
    const req = socket.request;
    console.log("room에 접속!!", socket.id, socket.ip);
    socket.on("disconnect", () => {
      console.log("클라이언트 접속해제", socket.id);
    });
  });

  game.on("connection", (socket) => {
    const req = socket.request;
    console.log("game 접속!!", socket.id, socket.ip);
    const {
      headers: { referer },
    } = req;
    console.log(referer.split("/"), referer.split("/").length);
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, "");
    socket.join(roomId);

    socket.to(roomId).emit("join", {
      id: socket.id,
    });
    joinRoom({ playerId: socket.id, roomId: roomId });

    socket.on("startGame", () => {
      if (getRoomById(roomId) && getRoomById(roomId).start()) {
        console.log("game Start!!");
        const toSendData = getRoomById(roomId).getToSendData(socket.id);
        console.log(toSendData);
        if (toSendData) game.to(roomId).emit("start", {});
      }
    });
    socket.on("getFirst", () => {
      const toSendData = getRoomById(roomId).getToSendData(socket.id);
      socket.emit("sendFirst", toSendData);
    });
    socket.on("get", () => {
      const toSendData = getRoomById(roomId).getToSendData(socket.id);
      console.log(toSendData.others);
      socket.emit("send", toSendData);
    });
    socket.on("event", (data) => {
      if (
        !getRoomById(roomId).board ||
        getRoomById(roomId).board.currentProcess === "ready"
      )
        return;
      if (
        getRoomById(roomId).board.currentProcess === "choosing" &&
        data.name === "choose" &&
        socket.id ===
          getRoomById(roomId).board.order[
            getRoomById(roomId).board.currentOrder
          ]
      ) {
        getRoomById(roomId).event(data);

        game.to(roomId).emit("complete");
        return;
      }
      if (getRoomById(roomId).board.currentProcess === "playing") {
        try {
          console.log(socket.id, "가 ", data.name, "을 함");
          data.playerId = socket.id;
          getRoomById(roomId).event(data);
        } catch (err) {
          console.log("error event");
        }
        game.to(roomId).emit("complete");
      }
    });
    socket.on("disconnect", () => {
      console.log("클라이언트 접속해제", socket.id);
      socket.leave(roomId);
      exitRoom({ playerId: socket.id, roomId });
      // const currentUsers = socket.adapter.rooms[roomId];
      // const userCount = currentUsers ? currentUsers : 0;
      // if (userCount === 0) {
      //   axios
      //     .delete(`http://localhost:8005/room/${roomId}`)
      //     .then(() => {
      //       console.log("방 삭제");
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     });
      // } else {
      //   socket.to(roomId).emit("exit", {
      //     id: socket.id,
      //   });
      // }
    });
  });
};
