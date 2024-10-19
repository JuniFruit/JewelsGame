import { createAnimationWithSprite } from "../animation";
import { Spell, SpellProps } from "./base";

export type MinefieldSpellProps = Omit<SpellProps, "size"> & {
  originInd: number;
};

export class MinefieldSpell extends Spell {
  originInd: number;
  constructor({ originInd, ...rest }: MinefieldSpellProps) {
    super({ size: { width: 0, height: 0 }, ...rest });
    this.animation = createAnimationWithSprite(
      this.position,
      "explosionEffect",
      undefined,
      1,
      this.board.jewels[originInd].size,
    );
    this.originInd = originInd;
  }

  cast(): void {
    this.reset();
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting(): void {
    super.stopCasting();
    const neighbors = this.board.getNeighorIndices(this.originInd);
    for (let i = 0; i < neighbors.length; i++) {
      const currNeighbor = neighbors[i];

      const currNeighbors = this.board.getNeighorIndices(currNeighbor);
      const currJewel = this.board.jewels[currNeighbor];
      if (currJewel.isMatchable()) {
        this.board.removeLine([currJewel.index]);
      }
      for (let j = 0; j < currNeighbors.length; j++) {
        const nJewel = this.board.jewels[currNeighbors[j]];
        if (nJewel.isMatchable()) {
          this.board.removeLine([nJewel.index]);
        }
      }
    }
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;

    this.animation.update(t, dt);
    if (this.animation.timer.isEnded) {
      this.stopCasting();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
