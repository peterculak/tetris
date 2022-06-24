import { randomPiece } from "./pieces";
export type MatrixRow = Array<number>;

export type Arena = Array<MatrixRow>;

export type GameState = {
  arena: Arena;
  player: Player;
};

export type Player = {
  matrix: Array<MatrixRow>;
  pos: Offset;
  score: number;
};

export type Offset = {
  x: number;
  y: number;
};

export interface Game {
  moveRight: () => void;
  moveLeft: () => void;
  moveDown: () => void;
  rotate: () => void;
  state: GameState;
}

export default class Tetris implements Game {
  private arena: Arena = this.createArena(12, 20);

  private player: Player = {
    pos: { x: 0, y: 0 },
    matrix: randomPiece(),
    score: 0,
  };

  constructor() {
    this.playerReset();
  }

  moveRight() {
    this.playerMove(1);
  }

  moveLeft() {
    this.playerMove(-1);
  }

  moveDown() {
    this.playerDrop();
  }

  rotate() {
    this.playerRotate(1);
  }

  get state(): GameState {
    return {
      player: { ...this.player },
      arena: [...this.arena],
    };
  }

  private createArena(w: number, h: number): Arena {
    const arena: Arena = [];
    while (h--) {
      arena.push(new Array(w).fill(0));
    }
    return arena;
  }

  private collide(arena: Arena, player: Player): boolean {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (
          m[y][x] !== 0 &&
          (arena[o.y + y] && arena[o.y + y][o.x + x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private merge(arena: Arena, player: Player): void {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  private _rotate(dir: number): void {
    for (let y = 0; y < this.player.matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [this.player.matrix[x][y], this.player.matrix[y][x]] = [
          this.player.matrix[y][x],
          this.player.matrix[x][y],
        ];
      }
    }
    if (dir > 0) {
      this.player.matrix.forEach((row) => row.reverse());
    } else {
      this.player.matrix.reverse();
    }
  }

  private playerReset(): void {
    this.player.matrix = randomPiece();
    this.player.pos.y = 0;
    this.player.pos.x =
      Math.floor(this.arena[0].length / 2) -
      Math.floor(this.player.matrix.length / 2);
  }

  private gameOver(): void {
    this.playerReset();
    this.player.score = 0;
    this.arena.forEach((row, y) => row.fill(0));
  }

  private playerRotate(dir: number): void {
    const pos = this.player.pos.x;
    let offset = 1;
    this._rotate(dir);

    while (this.collide(this.arena, this.player)) {
      this.player.pos.x += offset;
      offset = -offset + (offset > 0 ? 1 : -1);
      if (offset > this.player.matrix[0].length) {
        this._rotate(-dir);
        this.player.pos.x = pos;
        return;
      }
    }
  }

  private playerDrop(): void {
    this.player.pos.y++;

    if (this.collide(this.arena, this.player)) {
      this.player.pos.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();

      if (this.collide(this.arena, this.player)) {
        this.gameOver();
      }
    }
  }

  private arenaSweep(): void {
    let sweptRows = 1;
    outer: for (let y = this.arena.length - 1; y > 0; --y) {
      for (let x = 0; x < this.arena[y].length; ++x) {
        if (this.arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      y++;
      this.player.score += sweptRows * 10;
      sweptRows *= 2;
    }
  }

  private playerMove(dir: number): void {
    this.player.pos.x += dir;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.x -= dir;
    }
  }
}
