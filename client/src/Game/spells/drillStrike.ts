import { createAnimationWithSprite } from "../animation";
import { detectCollision } from "../utils";
import { Spell, SpellProps } from "./base";

export type DrillStrikeSpellProps = Omit<SpellProps, "size"> & {};

export class DrillStrikeSpell extends Spell {
  private movingFactor = 1.2;
  constructor({ ...rest }: DrillStrikeSpellProps) {
    super({ size: { width: 50, height: 50 }, ...rest });
    this.animation = createAnimationWithSprite(this.position, "jewelAttack_2");
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
    this.board.opponentBoard.applyDamage(50);
    this.board.changeChargeLevel(20);
  }

  private checkCollision() {
    const len = this.board.jewels.length;
    for (let i = 0; i < len; i++) {
      const jewel = this.board.jewels[i];
      if (jewel.isMatchable()) {
        if (
          detectCollision(jewel.position, jewel.size, this.position, this.size)
        ) {
          this.board.removeLine([jewel.index]);
        }
      }
    }
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    if (this.isMoving) {
      this.updateMoving(dt);
    }
    this.checkCollision();

    this.animation.update(t, dt);
    if (this.animation.timer.isEnded) {
      this.stopCasting();
    }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
