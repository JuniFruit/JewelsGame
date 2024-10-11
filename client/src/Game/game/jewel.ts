import {
  Animation,
  createAnimationWithSprite,
  createSprite,
  Sprite,
} from "../animation";
import { JEWEL_SPELL_CONVERSION, JEWEL_TYPE_TO_COLOR } from "../config";
import {
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
  Timer,
} from "../sharedEntities";
import {
  detectCollision,
  getMovingProps,
  getPositionByInd,
  GRAVITY_VEC,
  Vector,
} from "../utils";

export type JewelProps = Omit<BaseEntityProps, "type"> & {
  jewelType: number;
  boardPos: Coords;
  boardSize: Size;
  boardRows: number;
  boardCols: number;
  index: number;
};

export class Jewel extends InteractableEntity {
  jewelType: number;
  jewelParentType: number = 0;
  index = -1;
  targetJewelType: number = 0; // temp var for conversion animation
  boardRows = 0;
  boardCols = 0;
  boardBot: number = 0;
  boardPos: Coords;
  boardRight: number = 0;
  physStartT: number = 0;
  fallingAnimTime: number = 0;
  // sprites
  jewelSprite: Sprite | undefined;
  hoveredSprite: Sprite | undefined;
  removeTimer: Timer;
  convertTimer: Timer;
  effect: Animation | undefined;
  // Diminished size for deeper collision detection
  draggingDetectionSize: Size;
  // vecs
  fallingVec: Vector;
  movingVec: Vector = new Vector({ x: 0, y: 0 });
  // constants
  dragRescaleFactor = 1.2;
  movingVelFactor = 5;
  draggingVelFactor = 40;
  fallingTimeSim = 2; // in seconds
  bounce = -0.2;
  removeDuration = 0.2;
  convertDuration = 0.4;
  // states
  isMoving = false;
  isFalling = false;
  isPhysicalized = false;
  isSelected = false;
  isConverting = false;
  isRemoving = false;
  isDisabled = false;
  isMerging = false;
  isDragging = false;
  isSwapping = false;
  constructor({
    size,
    position,
    jewelType,
    boardPos,
    boardSize,
    boardCols,
    boardRows,
    index,
  }: JewelProps) {
    super({ size, position, type: "jewel" });
    this.jewelType = jewelType;
    this.fallingVec = new Vector({ x: 0, y: 2 });
    this.boardBot = boardPos.y + boardSize.height;
    this.boardRight = boardPos.x + boardSize.width;
    this.targetPosition = position;
    this.boardPos = boardPos;
    this.index = index;
    this.boardRows = boardRows;
    this.boardCols = boardCols;
    const sizeFactor = 0.4;
    this.draggingDetectionSize = {
      width: size.width * sizeFactor,
      height: size.height * sizeFactor,
    };
    this.removeTimer = new Timer({ time: this.removeDuration });
    this.convertTimer = new Timer({ time: this.convertDuration });
    this.setJewelSprite();
    this.setJewelParentType();
  }

  private setJewelParentType() {
    this.jewelParentType =
      JEWEL_SPELL_CONVERSION[this.jewelType]?.parentType || this.jewelType;
  }

  setEffect(effectKey: string, animationTime = 0) {
    this.effect = createAnimationWithSprite(
      this.position,
      effectKey,
      this.size,
      animationTime,
    );
    this.effect.play();
  }

  disable() {
    this.reset();
    this.jewelType = 0;
    this.isDisabled = true;
  }

  setDragging(val: boolean) {
    this.isDragging = val;
    if (val) {
      this.position = this.getIndexPos();
    }
    if (val && this.jewelSprite) {
      this.jewelSprite.rescale(
        this.jewelSprite.initialScale * this.dragRescaleFactor,
      );
    } else if (this.jewelSprite) {
      this.jewelSprite.rescale(this.jewelSprite.initialScale);
    }
  }

  reset() {
    super.resetMouseStates();
    this.removeTimer.reset();
    this.convertTimer.reset();
    this.isMerging = false;
    this.isPhysicalized = false;
    this.isMoving = false;
    this.isSelected = false;
    this.isFalling = false;
    this.isConverting = false;
    this.isRemoving = false;
    this.isSwapping = false;
    this.effect = undefined;
  }

  private setJewelSprite() {
    this.jewelSprite = createSprite(this.position, this.jewelType, {
      ...this.size,
    });
    // this.hoveredSprite = createSprite(this.position, "jewelHover", this.size);
    this.jewelSprite.play();
    // this.hoveredSprite.play();
  }

  get isSpell() {
    return this.jewelType > 6;
  }

  checkDraggingCollision(otherJewel: Jewel) {
    return detectCollision(
      this.position,
      this.draggingDetectionSize,
      otherJewel.targetPosition,
      otherJewel.draggingDetectionSize,
    );
  }

  checkCollision(otherJewel: Jewel) {
    if (!this.isPhysicalized) return;
    if (
      this.position.y + this.size.height >= otherJewel.position.y &&
      this.position.x === otherJewel.position.x &&
      this.index < otherJewel.index
    ) {
      this.bounceOff(otherJewel);
    }
  }

  isMatchable() {
    if (this.isMerging || this.isRemoving || this.isFalling) {
      return false;
    }
    return true;
  }

  setSelected(val: boolean) {
    this.isSelected = val;
  }

  dragTo(pos: Coords) {
    let newPosX = pos.x - this.clickedPosition.x;
    let newPosY = pos.y - this.clickedPosition.y;
    let x = 0;
    let y = 0;

    if (newPosX + this.size.width >= this.boardRight) {
      newPosX = this.boardRight - this.size.width;
    }
    if (newPosX <= this.boardPos.x) {
      newPosX = this.boardPos.x;
    }
    if (newPosY + this.size.height >= this.boardBot) {
      newPosY = this.boardBot - this.size.height;
    }
    if (newPosY <= this.boardPos.y) {
      newPosY = this.boardPos.y;
    }

    if (newPosX >= this.initialPos.x + this.size.width) {
      newPosX = this.initialPos.x + this.size.width;
    }
    if (newPosX <= this.initialPos.x - this.size.width) {
      newPosX = this.initialPos.x - this.size.width;
    }
    if (newPosY >= this.initialPos.y + this.size.height) {
      newPosY = this.initialPos.y + this.size.height;
    }
    if (newPosY <= this.initialPos.y - this.size.height) {
      newPosY = this.initialPos.y - this.size.height;
    }
    // TODO reconsider factor
    const leftBoundFactor = 5;
    const rightBoundFactor = 5;
    const upBoundFactor = 5;
    const downBoundFactor = 5;

    if (
      this.position.x >= this.initialPos.x - leftBoundFactor &&
      this.position.x <= this.initialPos.x + rightBoundFactor &&
      this.position.y >= this.initialPos.y - upBoundFactor &&
      this.position.y <= this.initialPos.y + downBoundFactor
    ) {
      x = newPosX;
      y = newPosY;
    } else if (
      this.position.x >= this.initialPos.x - leftBoundFactor &&
      this.position.x <= this.initialPos.x + rightBoundFactor
    ) {
      x = this.initialPos.x;
      y = newPosY;
    } else {
      y = this.initialPos.y;
      x = newPosX;
    }
    this.moveTo({ x, y });
  }

  isSwappable() {
    if (this.isDisabled || this.isMerging || this.isRemoving) {
      return false;
    }

    return true;
  }

  isSelectable() {
    if (
      this.isDisabled ||
      this.isDragging ||
      this.isMerging ||
      this.isMoving ||
      this.isPhysicalized ||
      this.isRemoving ||
      this.isSwapping
    ) {
      return false;
    }

    return true;
  }

  getIndexPos() {
    return getPositionByInd(
      this.index,
      this.boardRows,
      this.boardCols,
      this.boardPos,
      this.size,
    );
  }

  moveToIndPos() {
    this.moveTo(this.getIndexPos());
  }

  swap(otherJewel: Jewel) {
    this.setDragging(false);
    this.isSwapping = true;
    otherJewel.isSwapping = true;
    otherJewel.setDragging(false);
    this.moveTo(otherJewel.getIndexPos());
    otherJewel.moveTo(this.getIndexPos());
    const temp = this.index;
    this.index = otherJewel.index;
    otherJewel.index = temp;
  }

  private isReachedTarget(vel: number) {
    const dx = Math.abs(this.position.x - this.targetPosition.x);
    const dy = Math.abs(this.position.y - this.targetPosition.y);
    const speed = Math.abs(vel);
    return dx <= speed && dy <= speed;
  }

  mergeTo(pos: Coords) {
    this.isRemoving = false;
    this.isMerging = true;
    this.moveTo(pos);
  }

  moveTo(pos: Coords) {
    super.resetMouseStates();
    this.isSelected = false;
    this.targetPosition = { ...pos };

    let factor = this.movingVelFactor;
    if (this.isSwapping) {
      factor = 10;
    }
    if (this.isDragging) {
      factor = this.draggingVelFactor;
    }

    const { distance, angle } = getMovingProps(this.position, pos);
    if (!distance) {
      this.isMoving = false;
      if (this.isSwapping) {
        this.isSwapping = false;
        return;
      }
    }
    const length = distance * 0.5 * factor;
    this.movingVec.setLength(length);
    this.movingVec.setAngle(angle);
    this.isMoving = true;
  }

  bounceOff(otherJewel: Jewel) {
    this.position.y = otherJewel.position.y - this.size.height;
    this.fallingVec.y *= this.bounce;
    otherJewel.fallingVec.y *= -0.1;
  }

  checkWallCollision() {
    if (!this.isPhysicalized) return;
    if (this.position.y + this.size.height >= this.boardBot) {
      // bounce up
      this.position.y = this.boardBot - this.size.height;
      this.fallingVec.y *= this.bounce;
    }
  }

  setFalling(targetPos: Coords, isPhysicalized = false) {
    this.setDragging(false);
    this.isFalling = true;
    this.isSwapping = false;
    if (!isPhysicalized) {
      this.moveTo(targetPos);
    } else {
      this.fallingAnimTime = this.fallingTimeSim;
      // this.initialPos = { ...this.targetPosition };
      this.targetPosition = { ...targetPos };
      this.isPhysicalized = true;
    }
  }

  checkIsHovered(mousePos: Coords): boolean {
    if (!this.isSelectable()) return false;
    const isHovered = super.checkIsHovered(mousePos);
    if (isHovered) {
    }
    return isHovered;
  }

  convertTo(targetType: number) {
    this.resetMouseStates();
    this.isRemoving = false;
    this.isMerging = false;
    this.isConverting = true;
    this.convertTimer.start();
    this.targetJewelType = targetType;
  }

  remove() {
    if (this.isMerging || this.isConverting) return;
    this.isRemoving = true;
    this.removeTimer.start();
  }

  private stopMoving() {
    this.isMoving = false;
    this.isSwapping = false;
    this.position = { ...this.targetPosition };
    if (!this.isDragging) {
      this.initialPos = { ...this.targetPosition };
    }
    this.movingVec.reset();
    if (!this.isPhysicalized && this.isFalling) {
      this.stopFalling();
    }
    if (this.isMerging) {
      this.isMerging = false;
      this.stopRemoving();
    }
  }

  private stopRemoving() {
    this.isRemoving = false;
    this.disable();
  }

  private stopFalling() {
    this.isFalling = false;
    this.isPhysicalized = false;
    this.position = { ...this.targetPosition };
    this.initialPos = { ...this.targetPosition };
  }

  private stopConverting() {
    this.isConverting = false;
    this.jewelType = this.targetJewelType;
    this.setJewelSprite();
    this.setJewelParentType();
  }

  private updateFalling(_t: number, dt: number) {
    this.fallingAnimTime -= dt;
    this.fallingVec.y += GRAVITY_VEC.y;
    this.position.y += this.fallingVec.y * dt;

    if (this.fallingAnimTime <= 0) {
      this.stopFalling();
    }
  }

  private updateConverting(t: number, dt: number) {
    this.convertTimer.update(t, dt);
    if (this.convertTimer.isEnded) {
      this.stopConverting();
    }
  }

  private updateRemoving(t: number, dt: number) {
    this.removeTimer.update(t, dt);
    if (this.removeTimer.isEnded) {
      this.stopRemoving();
    }
  }

  private move(_t: number, dt: number) {
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;

    if (this.isReachedTarget(this.movingVec.getLength() * dt)) {
      this.stopMoving();
    }
  }
  private updateAnimations(t: number, dt: number) {
    if (this.jewelSprite) {
      this.jewelSprite.update(t, dt);
      this.jewelSprite.position = this.position;
    }
    if (this.isHovered && this.hoveredSprite) {
      this.hoveredSprite.update(t, dt);
      this.hoveredSprite.position = this.position;
    }
  }

  update(t: number, dt: number) {
    if (this.isDisabled) return;
    if (this.isRemoving) {
      this.updateRemoving(t, dt);
    }
    if (this.isConverting) {
      this.updateConverting(t, dt);
    }
    if (this.isMoving || this.isDragging) {
      this.move(t, dt);
    }
    if (this.isFalling && this.isPhysicalized) {
      this.updateFalling(t, dt);
    }
    if (this.effect) {
      this.effect.update(t, dt);
    }
    this.updateAnimations(t, dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDisabled || this.isRemoving) return;

    if (this.isHovered && !this.isSelected) {
      this.hoveredSprite?.draw(ctx);
    }
    if (this.jewelSprite) {
      this.jewelSprite.draw(ctx);
    } else {
      ctx.fillStyle = JEWEL_TYPE_TO_COLOR[this.jewelType];
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height,
      );
    }

    if (this.isHovered && !this.isSelected && !this.hoveredSprite) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = "white";
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height,
      );
    }
    if (this.effect) {
      this.effect.draw(ctx);
    }
  }
}
