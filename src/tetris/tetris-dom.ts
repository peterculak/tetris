import Tetris, { Game, Offset, Arena } from "./tetris";

enum Colors {
  null,
  "#e27d60",
  "#85dcb0",
  "#e8a87c",
  "#c38d9e",
  "#41b3a3",
  "#f64c72",
  "#fbeec1",
}

enum Controls {
  left = "left",
  right = "right",
  down = "down",
  rotate = "rotate",
}

type Options = {
  controls?: {
    [K in Controls]: string;
  };
  dropInterval?: number;
};

export default class TetrisDom {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private game: Game;
  private lastTime: number = 0;
  private dropCounter: number = 0;

  private defaults: Options = {
    controls: {
      left: "ArrowLeft",
      right: "ArrowRight",
      down: "ArrowDown",
      rotate: "ArrowUp",
    },
    dropInterval: 1000,
  };

  constructor(
    _canvasId: string,
    private _scoreId: string,
    private options?: Options
  ) {
    this.canvas = document.getElementById(_canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;
    this.context.scale(20, 20);
    this.game = new Tetris();

    this.options = {
      ...this.defaults,
      ...options,
    };

    document.addEventListener("keydown", (e: KeyboardEvent): void => {
      if (e.code === this.options.controls.right) {
        this.game.moveRight();
      } else if (e.code === this.options.controls.left) {
        this.game.moveLeft();
      } else if (e.code === this.options.controls.down) {
        this.game.moveDown();
      } else if (e.code === this.options.controls.rotate) {
        this.game.rotate();
      }
    });
  }

  public start(time = 0): void {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.options.dropInterval) {
      this.game.moveDown();
      this.dropCounter = 0;
    }
    this.drawGame();
    requestAnimationFrame(this.start.bind(this));
  }

  private drawGame(): void {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawArena(this.game.state.arena, { x: 0, y: 0 });
    this.drawArena(this.game.state.player.matrix, this.game.state.player.pos);

    document.getElementById(this._scoreId)!.innerHTML =
      this.game.state.player.score + "";
  }

  private drawArena(arena: Arena, offset: Offset): void {
    arena.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.context.fillStyle = Colors[value];
          this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
}
