import { Board } from "../board";
import { BaseEntityProps, Coords, InteractableEntity } from "../sharedEntities";

export type HealthBarProps = Omit<BaseEntityProps, "type"> & {
  board: Board;
  player: "p1" | "p2";
};

export class HealthBar extends InteractableEntity {
  board: Board;
  currentHealth: number;
  fillColor = "";
  ctx: CanvasRenderingContext2D | undefined;
  private latestDmg = 0;
  private applyingFactor = 10;
  private textPos: Coords = { x: 0, y: 0 };
  isApplyingDmg = false;

  constructor({ position, size, board, player }: HealthBarProps) {
    super({ position, size, type: "healthbar" });
    this.board = board;
    this.currentHealth = board.health;
    this.fillColor = player === "p1" ? "blue" : "red";
  }

  applyDamage(val: number) {
    if (this.currentHealth <= 0) return;

    this.isApplyingDmg = true;
    this.latestDmg = val;
    this.calculateTextPos(`-${this.latestDmg}`);
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

  private updateApplyDmg(_t: number, dt: number) {
    this.currentHealth -= this.latestDmg * this.applyingFactor * dt;
    this.size.width = this.initialSize.width * (this.currentHealth * 0.01);
    if (this.currentHealth <= this.board.health) {
      this.isApplyingDmg = false;
      this.currentHealth = this.board.health;
    }
  }

  update(t: number, dt: number) {
    if (this.isApplyingDmg) {
      this.updateApplyDmg(t, dt);
    }
  }

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
    if (this.isApplyingDmg) {
      this.ctx.fillStyle = "black";
      this.ctx.fillText(`-${this.latestDmg}`, this.textPos.x, this.textPos.y);
    }
  }
}
