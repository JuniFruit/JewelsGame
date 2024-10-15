import { Board } from "../game/board";
import { BaseEntityProps, Coords, InteractableEntity } from "../sharedEntities";

export type HealthBarProps = Omit<BaseEntityProps, "type"> & {
  board: Board;
  player: "p1" | "p2";
};

export class HealthBar extends InteractableEntity {
  board: Board;
  fillColor = "";
  ctx: CanvasRenderingContext2D | undefined;
  private latestDmg = 0;
  private applyingFactor = 10;
  private textPos: Coords = { x: 0, y: 0 };

  constructor({ position, size, board, player }: HealthBarProps) {
    super({ position, size, type: "healthbar" });
    this.board = board;
    this.fillColor = player === "p1" ? "blue" : "red";
  }

  applyDamage(val: number) {
    this.latestDmg = val;
    this.readjustBar();
  }

  reset() {
    this.readjustBar();
  }

  private readjustBar() {
    this.size.width = this.initialSize.width * (this.board.healthPer * 0.01);
    this.calculateTextPos(
      `${Math.trunc(this.board.health)} / ${this.board.totalHealth}`,
    );
  }

  applyHeal(val: number) {
    this.readjustBar();
  }

  private calculateText(text: string) {
    // this.ctx.font = this.currentFont;
    const textMeasure = this.ctx?.measureText(text);
    return textMeasure;
  }

  private calculateTextPos(text: string) {
    const textMeasure = this.calculateText(text);
    if (!textMeasure) return;
    // centered
    this.textPos.x =
      this.position.x +
      (this.initialSize.width * 0.5 - textMeasure.width * 0.5);
    this.textPos.y =
      this.position.y +
      this.initialSize.height * 0.5 +
      textMeasure.hangingBaseline * 0.5;
  }

  update(t: number, dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.ctx) {
      this.ctx = ctx;
    }
    ctx.lineWidth = 2;
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.initialSize.width,
      this.initialSize.height,
    );

    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.ctx.fillStyle = "black";
    this.ctx.fillText(
      `${this.board.health} / ${this.board.totalHealth}`,
      this.textPos.x,
      this.textPos.y,
    );
  }
}
