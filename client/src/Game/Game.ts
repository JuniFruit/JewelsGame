import { P1_BOARD, P2_BOARD } from "./config";
import { Board } from "./entities";

export type GameProps = {
  mode?: string;
  ctx: CanvasRenderingContext2D;
};

export type Matches = {
  horMatches: number[]; // array of indices within the layout array
  vertMatches: number[];
};

export class Game {
  mode;
  ctx: CanvasRenderingContext2D;
  p1Board: Board;
  p2Board: Board;
  isPaused = false;

  constructor({ mode = "multiplayer", ctx }: GameProps) {
    this.mode = mode;
    this.ctx = ctx;
    this.p1Board = new Board(P1_BOARD);
    this.p2Board = new Board(P2_BOARD);
  }

  setPause(val: boolean) {
    this.isPaused = val;
  }

  setBoard(layout: number[], player: "p1" | "p2") {
    if (player === "p1") {
      this.p1Board.generateJewels(layout);
    } else {
      this.p2Board.generateJewels(layout);
    }
    this.p1Board.setOpponentBoard(this.p2Board);
    this.p2Board.setOpponentBoard(this.p1Board);
  }

  update(t: number, dt: number) {
    if (this.isPaused) return;
    this.p1Board.update(t, dt);
    this.p2Board.update(t, dt);
  }

  draw() {
    this.p1Board.draw(this.ctx);
    this.p2Board.draw(this.ctx);
  }
}
