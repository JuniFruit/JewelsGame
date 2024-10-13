import { UI } from ".";
import { Game } from "../game";
import { BaseEntityProps, Coords, InteractableEntity } from "../sharedEntities";
import { BoardUI } from "./boardUI";
import { Button } from "./button";

export type GameUiProps = Omit<
  BaseEntityProps,
  "type" | "position" | "size"
> & {
  game: Game;
  ui: UI;
};
export class InGameUI extends InteractableEntity {
  game: Game;
  ui: UI;
  p1BoardUI: BoardUI;
  p2BoardUI: BoardUI;

  constructor({ game, ui, ...rest }: GameUiProps) {
    super({
      ...rest,

      type: "game_ui",
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
    });
    this.ui = ui;
    this.game = game;
    this.p1BoardUI = new BoardUI({
      board: this.game.p1Board,
    });
    this.p2BoardUI = new BoardUI({
      board: this.game.p2Board,
    });
    this.game.p1Board.UI = this.p1BoardUI;
    this.game.p2Board.UI = this.p2BoardUI;
  }

  update(t: number, dt: number) {
    this.p1BoardUI.update(t, dt);
    this.p2BoardUI.update(t, dt);
    if (this.game.isOver) {
      this.onGameOver();
    }
  }

  checkIsHovered(pos: Coords) {
    if (this.game.isOver || !this.game.isStarted) return false;
    this.p1BoardUI.mouseMove(pos);
    return this.p1BoardUI.checkIsHovered(pos);
  }
  mouseUp(mousePos: Coords): void {
    if (this.game.isOver || !this.game.isStarted) return;

    this.p1BoardUI.mouseUp(mousePos);
  }
  mouseOut(_mousePos: Coords): void {
    if (this.game.isOver || !this.game.isStarted) return;

    this.p1BoardUI.mouseOut(_mousePos);
  }
  mouseDown(_mousePos: Coords): void {
    if (this.game.isOver || !this.game.isStarted) return;

    this.p1BoardUI.mouseDown(_mousePos);
  }

  drawGame(ctx: CanvasRenderingContext2D) {
    if (!this.p1BoardUI || !this.p2BoardUI) return;
    this.p1BoardUI.draw(ctx);
    this.p2BoardUI.draw(ctx);
    this.p1BoardUI.drawAnimations(ctx);
    this.p2BoardUI.drawAnimations(ctx);
  }

  private onGameOver() {
    const startBtn = this.ui.getElementByText("Start game") as Button;
    if (startBtn) {
      startBtn.activate();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawGame(ctx);
    if (
      !this.game.isStarted &&
      !this.game.isOver &&
      this.game.countDownTimer.isGoing
    ) {
      const text =
        "Game starts in: " + Math.trunc(this.game.countDownTimer.timeLeft + 1);
      const tSise = ctx.measureText(text);

      ctx.fillText(
        "Game starts in: " + Math.trunc(this.game.countDownTimer.timeLeft + 1),
        ctx.canvas.getBoundingClientRect().width * 0.5 - tSise.width * 0.5,
        170,
      );
    }

    if (this.game.isOver && this.game.winner) {
      const text = "Winner is " + this.game.winner;
      const tSise = ctx.measureText(text);

      ctx.fillText(
        text,
        ctx.canvas.getBoundingClientRect().width * 0.5 - tSise.width * 0.5,
        170,
      );
    }
  }
}
