const canvas = document.getElementById('tetris') as HTMLCanvasElement;
const context = canvas.getContext('2d');

context.scale(20, 20);

enum Colors {
  null,
  '#e27d60',
  '#85dcb0',
  '#e8a87c',
  '#c38d9e',
  '#41b3a3',
  '#f64c72',
  '#fbeec1',
}

type Matrix = Array<Row>;
type Row = Array<number>;

type Player = {
  matrix: Matrix,
  pos: Offset,
  score: number,
}

type Offset = {
  x: number,
  y: number,
}

const PIECE_T: Matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const PIECE_O: Matrix = [
  [2, 2],
  [2, 2]
];

const PIECE_L: Matrix = [
  [0, 3, 0],
  [0, 3, 0],
  [0, 3, 3],
];

const PIECE_J: Matrix = [
  [0, 4, 0],
  [0, 4, 0],
  [4, 4, 0],
];

const PIECE_I: Matrix = [
  [0, 5, 0, 0],
  [0, 5, 0, 0],
  [0, 5, 0, 0],
  [0, 5, 0, 0],
];

const PIECE_S: Matrix = [
  [0, 6, 6],
  [6, 6, 0],
  [0, 0, 0],
];

const PIECE_Z: Matrix = [
  [7, 7, 0],
  [0, 7, 7],
  [0, 0, 0],
];

enum PieceType {
  T = 'T',
  O = 'O',
  L = 'L',
  J = 'J',
  I = 'I',
  S = 'S',
  Z = 'Z',
};

type PieceTypes = {
  -readonly [K in PieceType]: Matrix
};

const pieces: PieceTypes = {
  T: PIECE_T,
  O: PIECE_O,
  L: PIECE_L,
  J: PIECE_J,
  I: PIECE_I,
  S: PIECE_S,
  Z: PIECE_Z,
};

function drawMatrix(matrix: Matrix, offset: Offset): void {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = Colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    })
  });
}

function createMatrix(w: number, h: number): Matrix {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  } 
  return matrix;
}

function collide(arena: Matrix, player: Player): boolean {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[o.y + y] && arena[o.y + y][o.x + x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena: Matrix, player: Player): void {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function draw(): void {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

let lastTime: number = 0;
let dropInterval: number = 1000;
let dropCounter: number = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function rotate(matrix: Matrix, dir: number): void {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ]
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function createPiece(type: PieceType): Matrix {
  if (!Object.values(PieceType).includes(type)) {
    throw new Error(`Invalid type '${type}'`);
  }

  return pieces[type];
}

function randomPiece(): Matrix {
  const pieces = Object.values(PieceType);
  return createPiece(PieceType[pieces[Math.floor(pieces.length * Math.random())]]);
}

function playerReset(): void {
  player.matrix = randomPiece();
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - (Math.floor(player.matrix.length / 2));
}

function gameOver(): void {
  playerReset();
  player.score = 0;
  updateScore();
  arena.forEach((row, y) => row.fill(0));
  dropCounter = 0;
}

function playerRotate(dir: number): void {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -offset + (offset > 0 ? 1 : -1);
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerDrop(): void {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
      updateScore();
      if (collide(arena, player)) {
        gameOver();
      }
    }
    dropCounter = 0;
}

function playerMove(dir: number): void {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function arenaSweep(): void {
  let sweptRows = 1;
  outer: for (let y = arena.length -1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    player.score += sweptRows * 10;
    sweptRows *= 2;
  }
}

function updateScore() {
  document.getElementById('score').innerHTML = player.score + '';
}

document.addEventListener('keydown', (e: KeyboardEvent): void => {
  if (e.code === 'ArrowRight') {
    playerMove(1);
  } else if (e.code === 'ArrowLeft') {
    playerMove(-1);
  } else if (e.code === 'ArrowDown') {
    playerDrop();
  } else if (e.code === 'ArrowUp') {
    playerRotate(1);
  }
});

declare var __player__: Player;
declare var __arena__: Matrix;
declare var __merge__:(arena: Matrix, player: Player) => void;

const player: Player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
};
const arena = createMatrix(12, 20);

window.__player__ = player;
window.__merge__ = merge;
window.__arena__ = arena;

playerReset();
updateScore();
update();