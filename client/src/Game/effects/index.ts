import { Effect } from "./base";

export class StunEffect extends Effect {
  update(t: number, dt: number): void {
    if (!this.isActive) return;

    this.timer.update(t, dt);

    if (this.timer.isEnded) {
      this.deactivate();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {}
}
