import { createAnimationWithSprite } from "../animation";
import { JEWEL_SPELL_TYPE } from "../config";
import { Spell, SpellProps } from "./base";

export type PoisonSpellProps = Omit<SpellProps, "size"> & {};

export class PoisonSpell extends Spell {
  private movingFactor = 3;
  constructor({ ...rest }: PoisonSpellProps) {
    super({ size: { width: 0, height: 0 }, ...rest });

    this.animation = createAnimationWithSprite(this.position, "jewelAttack_4");
  }

  cast(): void {
    this.reset();
    if (!this.board.opponentBoard) return;
    this.moveTo(this.board.opponentBoard.getBoardCenter(), this.movingFactor);
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting(): void {
    super.stopCasting();
    if (!this.board.opponentBoard) return;
    this.board.opponentBoard.applyEffect(JEWEL_SPELL_TYPE.POISON);
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    if (this.isMoving) {
      this.updateMoving(dt);
    }

    this.animation.update(t, dt);
    if (this.animation.timer.isEnded) {
      this.stopCasting();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
