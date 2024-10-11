import { createAnimationWithSprite } from "../animation";
import { Spell, SpellProps } from "./base";

export type VampiricSpellProps = Omit<SpellProps, "size"> & {};

export class VampiricSpell extends Spell {
  constructor({ ...rest }: VampiricSpellProps) {
    super({ size: { width: 0, height: 0 }, ...rest });

    this.animation = createAnimationWithSprite(
      this.position,
      "jewelConvert",
      { width: 50, height: 50 },
      0.5,
    );
  }

  cast(): void {
    this.reset();
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting(): void {
    super.stopCasting();
    this.board.applyHeal(40);
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
