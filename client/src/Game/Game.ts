import { JEWEL_TYPE, P1_BOARD, P2_BOARD } from "./config";
import { Board } from "./board";

export type GameProps = {
  mode?: string;
  ctx: CanvasRenderingContext2D;
};

export type Matches = number[];

export class Game {
  mode;
  ctx: CanvasRenderingContext2D;
  p1Board: Board;
  p2Board: Board;
  isPaused = false;
  jewelBankP1: number[] = [];
  jewelBankP2: number[] = [];

  constructor({ mode = "multiplayer", ctx }: GameProps) {
    this.mode = mode;
    this.ctx = ctx;
    this.p1Board = new Board(P1_BOARD);
    this.p2Board = new Board(P2_BOARD);
  }

  setPause(val: boolean) {
    this.isPaused = val;
  }

  test(board: Board) {
    const layout = [];
    const types = Object.values(JEWEL_TYPE);

    for (let i = 0; i < board.jewels.length; i++) {
      if (board.jewels[i].isDisabled) {
        layout[i] = types[Math.floor(Math.random() * 6)];
      } else {
        layout[i] = -1;
      }
    }
    board.generateJewels(layout);
  }

  private addJewels(player: "p1" | "p2") {
    if (player === "p1") {
      this.test(this.p1Board);
    } else {
      this.test(this.p2Board);
    }
  }

  setBoard(layout: number[], player: "p1" | "p2") {
    if (player === "p1") {
      this.p1Board.generateJewels(layout, true);
    } else {
      this.p2Board.generateJewels(layout, true);
    }
    this.p1Board.setOpponentBoard(this.p2Board);
    this.p2Board.setOpponentBoard(this.p1Board);
  }

  update(t: number, dt: number) {
    if (this.isPaused) return;
    if (this.p1Board.isReadyToRefill) {
      this.p1Board.isReadyToRefill = false;
      this.addJewels("p1");
      return;
    }
    if (this.p2Board.isReadyToRefill) {
      this.p2Board.isReadyToRefill = false;
      this.addJewels("p2");
      return;
    }

    this.p1Board.update(t, dt);
    this.p2Board.update(t, dt);
  }

  draw() {
    this.p1Board.draw(this.ctx);
    this.p2Board.draw(this.ctx);
    this.p1Board.drawAnimations(this.ctx);
    this.p2Board.drawAnimations(this.ctx);
  }
}
