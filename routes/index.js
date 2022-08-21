const express = require("express");
const { render } = require("nunjucks");
const {
  getRooms,
  createNewRoom,
  getRoomById,
  deleteRoomById,
} = require("../game.js");

const router = express.Router();

router.get("/room", (req, res) => {
  res.render("room", { title: "방 생성" });
});

router.post("/room", (req, res) => {
  const newRoom = createNewRoom(req.body);
  const io = req.app.get("io");
  io.of("/room").emit("newRoom", newRoom);
  res.redirect(`/room/${newRoom.id}`);
});

router.get("/", (req, res) => {
  const rooms = getRooms();
  res.render("main", { rooms, title: "방 목록" });
});

router.get("/room/:id", (req, res) => {
  const room = getRoomById(req.params.id);
  console.log(room, req.params.id);
  if (!room) {
    return res.redirect("/?message=방이 없습니다");
  }
  if (room && room.max <= room.players.length) {
    return res.redirect("/?message=빈 자리가 없습니다");
  }
  return res.render("game", {
    room,
    title: room.title,
  });
});

router.delete("/room/:id", (req, res) => {
  deleteRoomById(req.params.id);
  res.send("ok");
  req.app.get("io").of("/room").emit("removeRoom", req.params.id);
});

module.exports = router;
