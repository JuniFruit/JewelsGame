import { Animation } from "../animation";
import { Board } from "../board";
import { BaseEntity, BaseEntityProps, Coords } from "../sharedEntities";
import { getMovingProps, Vector } from "../utils";

export type SpellProps = Omit<BaseEntityProps, "type"> & {
  animation?: Animation;
  castTime?: number;
  spellType: string;
  board: Board;
};

export abstract class Spell extends BaseEntity {
  animation: Animation;
  isFinished = false;
  isCasting = false;
  isMoving = false;
  board: Board;
  spellType: string;
  movingVec: Vector;
  constructor({
    position,
    size,
    board,
    spellType,
    castTime = Infinity,
  }: SpellProps) {
    super({ position, size, type: "spell" });
    this.spellType = spellType;
    this.board = board;
    this.animation = new Animation({ animationTime: castTime });
    this.movingVec = new Vector({ x: 0, y: 0 });
  }

  protected moveTo(pos: Coords, factor = 0, time: number = 0) {
    this.targetPosition = { ...pos };
    const { distance, angle } = getMovingProps(this.position, pos);
    const length = distance * 0.5 * factor;

    this.movingVec.setLength(length);
    this.movingVec.setAngle(angle);
    if (this.animation.sprite) {
      this.animation.sprite.setAngle(angle);
    }
    this.animation.timer.setTime(time || distance / length);
    this.isMoving = true;
  }

  protected updateMoving(dt: number) {
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;

    if (this.animation.sprite) {
      this.animation.sprite.position = this.position;
    }
  }

  reset() {
    this.isFinished = false;
    this.isCasting = false;
    this.isMoving = false;
  }
  protected stopCasting() {
    this.isFinished = true;
    this.isCasting = false;
  }
  abstract cast(): void;
  abstract update(t: number, dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
