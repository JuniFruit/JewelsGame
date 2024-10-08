import { createAnimationWithSprite } from "../animation";
import { JEWEL_SPELL_TYPE } from "../config";
import { Spell, SpellProps } from "./base";

export type ShieldSpellProps = Omit<SpellProps, "size"> & {};

export class ShieldSpell extends Spell {
  constructor({ ...rest }: ShieldSpellProps) {
    super({ size: { width: 0, height: 0 }, ...rest });

    this.animation = createAnimationWithSprite(
      this.position,
      "shieldEffect",
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
    this.board.applyEffect(JEWEL_SPELL_TYPE.SHIELD);
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
