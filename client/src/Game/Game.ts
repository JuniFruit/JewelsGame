import { JEWEL_TYPE, P1_BOARD, P2_BOARD } from "./config";
import { Board } from "./board";
import { convertTo2dInd } from "./utils";
import { Timer } from "./sharedEntities";

export type GameProps = {
  mode?: string;
};

export type Matches = number[];

export class Game {
  mode;
  p1Board: Board;
  p2Board: Board;
  isPaused = false;
  isStarted = false;
  isOver = false;
  winner = "";
  jewelBankP1: number[] = [];
  jewelBankP2: number[] = [];
  cols: number;
  rows: number;
  timeElapsed = 0;
  countDownTimer: Timer;

  constructor({ mode = "multiplayer" }: GameProps) {
    this.mode = mode;
    this.p1Board = new Board(P1_BOARD);
    this.p2Board = new Board(P2_BOARD);
    this.rows = this.p1Board.rows;
    this.cols = this.p1Board.cols;
    this.countDownTimer = new Timer({ time: 5 });
  }

  setPause(val: boolean) {
    this.isPaused = val;
  }

  private generateBoards() {
    const layout = [];
    const size = this.rows * this.cols;
    const types = Object.values(JEWEL_TYPE);
    for (let i = 0; i < size; i++) {
      layout[i] = types[Math.floor(Math.random() * 6)];
    }

    if (this.isSolvable(layout)) {
      this.setBoard(layout, "p1");
      this.setBoard(layout, "p2");
    } else {
      this.generateBoards();
    }
  }

  reset() {
    this.timeElapsed = 0;
    this.isOver = false;
    this.winner = "";
    this.isStarted = false;
    this.isPaused = false;
    this.countDownTimer.reset();
    this.p1Board.reset();
    this.p2Board.reset();
  }

  startGame() {
    this.reset();
    this.generateBoards();
    this.countDownTimer.start();
  }

  gameOver(winner: "p1" | "p2") {
    this.winner = winner;
    this.isOver = true;
  }

  private checkIsOver() {
    if (this.isOver) return;
    if (this.p1Board.health <= 0) {
      this.gameOver("p2");
      return;
    }
    if (this.p2Board.health <= 0) {
      this.gameOver("p1");
      return;
    }
  }

  private fillGaps(board: Board) {
    const layout = board.getLayout();
    const layoutToGenerate: number[] = [];
    const types = Object.values(JEWEL_TYPE);
    let lastDisabledInd = 0;

    for (let i = 0; i < layout.length; i++) {
      if (layout[i] === 0) {
        layout[i] = types[Math.floor(Math.random() * 6)];
        layoutToGenerate[i] = layout[i];
        lastDisabledInd = i;
      } else {
        layoutToGenerate[i] = -1;
      }
    }
    const { row } = convertTo2dInd(lastDisabledInd, board.rows, board.cols);
    if (this.isSolvable(layout)) {
      board.generateJewels(layoutToGenerate, false, row);
    } else {
      this.fillGaps(board);
    }
  }

  isSolvable(layout: number[]) {
    const l = layout;
    let s = l.join("");
    const len = s.length;

    for (let i = this.cols - 1; i < len; i += this.cols) {
      s = s.slice(0, i + 1) + "A" + s.slice(i + 1);
    }
    const result =
      /(\d)(\1(\d|.{6}|.{9})|(\d|.{6}|.{9})\1|.{7}\1(.|.{9})|(.|.{9})\1.{7}|(.{7,9}|.{17})\1.{8}|.{8}\1(.{7,9}|.{17}))\1/.test(
        s,
      );
    return result;
  }

  private addJewels(player: "p1" | "p2") {
    if (player === "p1") {
      this.fillGaps(this.p1Board);
    } else {
      this.fillGaps(this.p2Board);
    }
  }

  setBoard(layout: number[], player: "p1" | "p2") {
    if (player === "p1") {
      this.p1Board.generateJewels(layout, !this.isStarted);
    } else {
      this.p2Board.generateJewels(layout, !this.isStarted);
    }
    this.p1Board.setOpponentBoard(this.p2Board);
    this.p2Board.setOpponentBoard(this.p1Board);
  }

  private checkRefill() {
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
  }

  private startBoards() {
    this.p1Board.isNewBoard = false;
    this.p2Board.isNewBoard = false;
    this.p1Board.removeOrMergeMatches();
    this.p2Board.removeOrMergeMatches();
  }

  update(t: number, dt: number) {
    if (this.isPaused || this.isOver) return;
    if (!this.isStarted && !this.countDownTimer.isEnded) {
      this.countDownTimer.update(t, dt);
    }
    if (this.countDownTimer.isEnded) {
      this.isStarted = true;
      this.startBoards();
    }

    this.p1Board.update(t, dt);
    this.p2Board.update(t, dt);
    if (this.isStarted) {
      this.timeElapsed += dt;
      this.checkRefill();
      this.checkIsOver();
    }
  }
}
