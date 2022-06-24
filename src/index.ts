import TetrisDom from "./tetris/tetris-dom";

const tetris = new TetrisDom("tetris", "score", {
  controls: { left: "KeyA", right: "KeyD", down: "KeyS", rotate: "KeyW" },
});
tetris.start();

const tetris2 = new TetrisDom("tetris2", "score2");
tetris2.start();
