import { createAnimationWithSprite, createSprite, Sprite } from "../animation";
import { BaseEntity, BaseEntityProps, Coords } from "../sharedEntities";
import { getMovingProps, pickRnd, Vector } from "../utils";
import { Spell, SpellProps } from "./base";

type ProjectileProps = Omit<BaseEntityProps, "type" | "size"> & {
  targetInd: number;
};
class Projectile extends BaseEntity {
  sprite: Sprite | undefined;
  private movingVec = new Vector({ x: 0, y: 0 });
  targetInd: number;
  isHit = false;
  constructor({ position, targetInd, ...rest }: ProjectileProps) {
    const size = { width: 30, height: 30 };

    super({
      ...rest,
      position,
      size,
      type: "projectile",
    });
    this.targetInd = targetInd;
    this.sprite = createSprite(position, "jewelAttack_5", size);
  }
  moveTo(pos: Coords) {
    this.targetPosition = { ...pos };
    const { distance, angle } = getMovingProps(this.position, pos);
    const length = distance * 0.5 * 1.5;

    this.movingVec.setLength(length);
    this.movingVec.setAngle(angle);
    this.sprite?.setAngle(angle);
  }
  private isReachedTarget(vel: number) {
    const dx = Math.abs(this.position.x - this.targetPosition.x);
    const dy = Math.abs(this.position.y - this.targetPosition.y);
    const speed = Math.abs(vel);
    return dx <= speed && dy <= speed;
  }

  update(_t: number, dt: number): void {
    if (this.isHit) return;
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;
    this.sprite?.update(_t, dt);
    if (this.isReachedTarget(this.movingVec.getLength() * dt)) {
      this.isHit = true;
    }
  }
  draw(_ctx: CanvasRenderingContext2D): void {
    this.sprite?.draw(_ctx);
  }
}

export type ContaminationSpellProps = Omit<
  SpellProps,
  "size" | "castTime"
> & {};

export class ContaminationSpell extends Spell {
  private projectiles: Projectile[] = [];
  private projectileCount = 10;
  constructor({ ...rest }: ContaminationSpellProps) {
    super({ size: { width: 50, height: 50 }, ...rest });
  }

  cast(): void {
    this.reset();
    this.animation.play();
    this.isCasting = true;
    this.createProjectiles();
  }

  private createProjectiles() {
    const usedIndices: number[] = [];
    for (let i = 0; i < this.projectileCount; i++) {
      let rndInd = pickRnd(0, this.board.jewels.length - 1);
      while (usedIndices.includes(rndInd)) {
        rndInd = pickRnd(0, this.board.jewels.length - 1);
      }
      usedIndices.push(rndInd);
      const jewel = this.board.jewels[rndInd];
      const projectile = new Projectile({
        position: { ...this.position },
        targetInd: jewel.index,
      });
      projectile.sprite?.play();
      projectile.moveTo(jewel.getIndexPos());
      this.projectiles.push(projectile);
    }
  }

  protected stopCasting() {
    super.stopCasting();
    this.board.removeOrMergeMatches();
  }

  private updateProjectiles(t: number, dt: number) {
    for (let i = 0; i < this.projectiles.length; i++) {
      this.projectiles[i].update(t, dt);
    }
  }

  private checkCollision() {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (p.isHit) {
        const jewel = this.board.jewels[p.targetInd];
        if (
          jewel.isMatchable() &&
          !jewel.isSpell &&
          jewel.jewelParentType !== 5
        ) {
          jewel.convertTo(5);
          jewel.stopConverting();

          const convertAnim = createAnimationWithSprite(
            jewel.position,
            "jewelConvert",
            jewel.size,
          );
          this.board.UI?.animations?.push(convertAnim);
          convertAnim.play();
        }
      }
    }
    this.projectiles = this.projectiles.filter((item) => !item.isHit);
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    this.updateProjectiles(t, dt);
    this.checkCollision();

    if (!this.projectiles.length) {
      this.stopCasting();
    }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isCasting) {
      for (let p of this.projectiles) {
        p.draw(ctx);
      }
    }
  }
}
