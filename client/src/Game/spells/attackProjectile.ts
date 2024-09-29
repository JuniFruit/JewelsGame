import { createAnimationWithSprite } from "../animation";
import { pickRnd } from "../utils";
import { Spell, SpellProps } from "./base";

export type AttackProjectileProps = Omit<SpellProps, "spellType" | "size"> & {
  damageOnHit: number;
  jewelType: number;
};

export class AttackProjectile extends Spell {
  damageOnHit: number;
  private movingFactor = 2;
  constructor({ damageOnHit, jewelType, ...rest }: AttackProjectileProps) {
    super({
      size: { width: 0, height: 0 }, // we do not care about size, size for the sprite is in conf file
      ...rest,
      spellType: "attackProjectile",
    });
    this.damageOnHit = damageOnHit;
    this.animation = createAnimationWithSprite(
      this.position,
      "jewelAttack_" + jewelType,
    );
  }

  cast(): void {
    this.reset();
    if (!this.board.opponentBoard) {
      console.error(`Spell: ${this.spellType} could not find opponentBoard`);
      return;
    }
    const opponentSide =
      this.position.x - this.board.opponentBoard.position.x < 0 ? 0 : 1;
    const target = {
      y: pickRnd(
        this.board.opponentBoard.position.y + 10,
        this.board.opponentBoard.position.y +
          this.board.opponentBoard.size.height,
      ),
      x:
        this.board.opponentBoard.position.x +
        this.board.opponentBoard!.size.width * opponentSide,
    };

    super.moveTo(target, this.movingFactor);
    this.animation.play();
    this.isCasting = true;
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    if (this.isMoving) {
      super.updateMoving(dt);
    }
    this.animation.update(t, dt);
    if (this.animation.timer.isEnded) {
      super.stopCasting();
      this.board.opponentBoard?.applyDamage(this.damageOnHit);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
