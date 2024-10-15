import { Game } from "./game";
import { Board } from "./game/board";
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
  moveTimer = new Timer({ time: Infinity, pulseBound: 3 });
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

  // TODO: make different alg
  private makeMove() {
    if (this.myBoard.chargeLevel === 100) {
      const choices = ["heal", "explosion"];
      this.myBoard.useCharge(
        choices[pickRnd(0, choices.length - 1)] as "heal" | "explosion",
      );
    }
    for (let i = 0; i < this.myBoard.jewels.length; i++) {
      for (let j = 0; j < this.myBoard.jewels.length; j++) {
        const success = this.myBoard.attemptSwap(i, j);
        if (success) {
          this.myBoard.changeChargeLevel(3);
          return;
        }
      }
    }
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
