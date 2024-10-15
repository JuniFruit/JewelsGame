import { createAnimationWithSprite } from "../animation";
import { Spell, SpellProps } from "./base";

export type CritStrikeProps = Omit<SpellProps, "size" | "position"> & {};

export class CritStrike extends Spell {
  constructor({ ...rest }: CritStrikeProps) {
    super({ position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, ...rest });

    this.animation = createAnimationWithSprite(
      this.board.opponentBoard?.getBoardCenter() || this.position,
      "critStrikeEffect",
      { width: 50, height: 50 },
      1,
    );
  }

  cast(): void {
    this.reset();
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting(): void {
    super.stopCasting();
    this.board.opponentBoard?.applyDamage(100);
    this.board.changeChargeLevel(10);
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    this.animation.update(t, dt);

    if (!this.animation.isAnimating) {
      this.stopCasting();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
