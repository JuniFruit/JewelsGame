import { createAnimationWithSprite } from "../animation";
import { Spell, SpellProps } from "./base";

export type StunSpellProps = SpellProps & {};

export class StunSpell extends Spell {
  private movingFactor = 2;
  constructor({ ...rest }: StunSpellProps) {
    super(rest);
    this.animation = createAnimationWithSprite(this.position, "jewelAttack_1");
  }

  cast(): void {
    this.reset();
    if (!this.board.opponentBoard) return;
    this.moveTo(this.board.opponentBoard.getBoardCenter(), this.movingFactor);
    this.animation.play();
    this.isCasting = true;
  }

  protected stopCasting() {
    super.stopCasting();
    if (!this.board.opponentBoard) return;
    console.log("STUNNED");
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
