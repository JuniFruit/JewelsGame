import { createAnimationWithSprite } from "../animation";
import { Spell, SpellProps } from "./base";

export type ExplosionProps = Omit<SpellProps, "size"> & {
  originInd: number;
};

export class ExplosionSpell extends Spell {
  originInd: number;
  constructor({ originInd, ...rest }: ExplosionProps) {
    super({ size: { width: 0, height: 0 }, ...rest });

    this.originInd = originInd;
    this.animation = createAnimationWithSprite(
      this.position,
      "jewelRemove_2",
      { width: 50, height: 50 },
      0.2,
    );
  }

  cast(): void {
    this.reset();
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting(): void {
    super.stopCasting();
    const indices = this.board.getNeighorIndices(this.originInd);
    this.board.removeLine([...indices, this.originInd]);
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
