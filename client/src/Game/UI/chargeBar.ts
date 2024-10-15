import { Board } from "../game/board";
import { BaseEntityProps, InteractableEntity } from "../sharedEntities";

export type ChargeBarProps = Omit<BaseEntityProps, "type"> & {
  board: Board;
};

export class ChargeBar extends InteractableEntity {
  board: Board;
  fillColor = "";
  ctx: CanvasRenderingContext2D | undefined;

  constructor({ position, size, board }: ChargeBarProps) {
    super({ position, size, type: "chargeBar" });
    this.board = board;
    this.fillColor = "green";
  }

  private readjustBar() {
    this.size.width = this.initialSize.width * (this.board.chargeLevel * 0.01);
  }

  update(_t: number, _dt: number) {
    this.readjustBar();
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
  }
}
