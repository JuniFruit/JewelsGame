import { Board } from "./board";
import { Game } from "./Game";
import { Timer } from "./sharedEntities";
import { pickRnd } from "./utils";

export type AIProps = {
  game: Game;
  player: "p1" | "p2";
};

export class AI {
  game: Game;
  player: "p1" | "p2";
  private myBoard: Board;
  moveTimer = new Timer({ time: Infinity, pulseBound: 0.3 });
  constructor({ game, player }: AIProps) {
    this.game = game;
    this.player = player;
    this.makeMove = this.makeMove.bind(this);

    if (player === "p1") {
      this.myBoard = game.p1Board;
    } else {
      this.myBoard = game.p2Board;
    }

    this.moveTimer.onPulse = this.makeMove;
  }

  reset() {
    this.moveTimer.reset();
  }

  private findPotentialMove() {
    const dirs = [1, -1, this.myBoard.cols, -this.myBoard.cols];
    const rndDir = pickRnd(0, dirs.length - 1);
    const ind1 = pickRnd(0, this.myBoard.jewels.length - 1);
    const ind2 = ind1 + rndDir;

    return { ind1, ind2 };
  }

  private makeMove() {
    const { ind1, ind2 } = this.findPotentialMove();
    this.myBoard.attemptSwap(ind1, ind2);
  }

  update(t: number, dt: number) {
    if (!this.moveTimer.isGoing) {
      this.moveTimer.start();
    }
    if (this.game.isStarted && !this.game.isOver) {
      this.moveTimer.update(t, dt);
    }
  }
}
