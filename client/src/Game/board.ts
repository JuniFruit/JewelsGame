import {
  JEWEL_SPELL_CONVERSION,
  JEWEL_SPELL_TYPE,
  JEWEL_TYPE_TO_COLOR,
  MOUSE_SIZE,
} from "./config";
import { Matches } from "./Game";
import {
  BaseEntity,
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
  Timer,
} from "./sharedEntities";
import {
  createAnimationWithSprite,
  createSprite,
  Sprite,
  Animation,
} from "./animation";
import { HealthBar } from "./UI";
import {
  convertTo2dInd,
  detectCollision,
  getPositionByInd,
  GRAVITY_VEC,
  Vector,
} from "./utils";

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
  removeTimer: Timer;
  convertTimer: Timer;
  effect: Animation | undefined;
  // Diminished size for deeper collision detection
  draggingDetectionSize: Size;
  opacity: number = 1; // for debbuggin, most likely to be removed
  // vecs
  fallingVec: Vector;
  targetPosition: Coords;
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
  isSpell = false;
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
  }

  setEffect(effectKey: string, animationTime = 0) {
    this.effect = createAnimationWithSprite(
      this.position,
      this.size,
      effectKey,
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
    if (val && this.jewelSprite) {
      this.jewelSprite.rescale(
        this.jewelSprite.initialScale * this.dragRescaleFactor,
      );
    } else if (this.jewelSprite) {
      this.jewelSprite.rescale(this.jewelSprite.initialScale);
    }
  }

  private reset() {
    super.resetMouseStates();
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
    this.jewelSprite = createSprite(this.position, this.size, this.jewelType);
    this.jewelSprite?.play();
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
    if (this.isMerging || this.isRemoving) {
      return false;
    }
    return true;
  }

  setSelected(val: boolean) {
    this.isSelected = val;
  }

  dragTo(pos: Coords) {
    let newPosX = pos.x - this.size.width * 0.5;
    let newPosY = pos.y - this.size.height * 0.5;
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
    return dx < speed && dy < speed;
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

    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!distance) {
      if (this.isSwapping) {
        this.isSwapping = false;
      }
      return;
    }

    let length = distance * 0.5 * this.movingVelFactor;
    if (this.isSwapping) {
      length = distance * 0.6 * 10;
    }
    if (this.isDragging) {
      length = distance * 0.6 * this.draggingVelFactor;
    }

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
    return super.checkIsHovered(mousePos);
  }

  convertTo(targetType: number) {
    this.resetMouseStates();
    this.isRemoving = false;
    this.isSpell = true;
    this.isConverting = true;
    this.convertTimer.start();
    this.targetJewelType = targetType;
  }

  remove() {
    if (this.isMerging) return;
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
  }

  private updateFalling(_t: number, dt: number) {
    if (this.index === 63) {
    }
    this.fallingAnimTime -= dt;
    this.fallingVec.y += GRAVITY_VEC.y;
    this.position.y += this.fallingVec.y * dt;

    if (this.fallingAnimTime <= 0) {
      this.stopFalling();
    }
  }

  private updateConverting(t: number, dt: number) {
    this.convertTimer.update(t, dt);
    if (!this.convertTimer.isEnded) {
      this.stopConverting();
    }
  }

  private updateRemoving(t: number, dt: number) {
    this.removeTimer.update(t, dt);
    if (!this.removeTimer.isEnded) {
      this.stopRemoving();
    }
  }

  private updateMoving(_t: number, dt: number) {
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;

    if (this.isReachedTarget(this.movingVec.getLength() * dt)) {
      this.stopMoving();
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
      this.updateMoving(t, dt);
    }
    if (this.isFalling && this.isPhysicalized) {
      this.updateFalling(t, dt);
    }
    if (this.effect) {
      this.effect.update(t, dt);
    }
    if (this.jewelSprite) {
      this.jewelSprite.update(t, dt);
      this.jewelSprite.position = this.position;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDisabled) return;
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

    if (this.isHovered && !this.isSelected) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = "white";
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height,
      );
    }
    if (this.isSelected) {
      ctx.strokeStyle = "black";
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

export type BoardProps = Omit<BaseEntityProps, "type"> & {
  cols: number;
  rows: number;
  health: number;
  player: "p1" | "p2";
};

export class Board extends BaseEntity {
  cols = 0;
  rows = 0;
  jewels: Jewel[] = [];
  t = 0;
  jewelSize: Size;
  health: number = 0;
  player: "p1" | "p2" = "p1";
  private healthBar: HealthBar;
  private hoveredInd = -1;
  private selectedInd = -1;
  private currentDraggingInd = -1;
  private indicesToFall: number[] = [];
  private spellsToCast: unknown[] = []; // queue for spells to cast
  private opponentBoard: Board | undefined;
  private currentSwapping: Jewel | undefined;
  private animations: Animation[] = [];
  // states
  shouldRevert = false;
  isFalling = false;
  isCastingSpell = false;
  isReadyToRefill = false;

  constructor({
    position,
    size,
    cols,
    rows,
    player,
    health = 100,
  }: BoardProps) {
    super({ position, size, type: "board" });
    this.cols = cols;
    this.rows = rows;
    this.health = health;
    this.player = player;
    this.jewelSize = {
      width: this.size.width / this.cols,
      height: this.size.height / this.rows,
    };
    this.healthBar = this.initHealthBar();
  }

  setOpponentBoard(board: Board) {
    this.opponentBoard = board;
  }

  applyDamage(val: number) {
    this.health -= val;
    this.healthBar.applyDamage(val);
  }

  private applySpell(type: number) {
    switch (type) {
      case JEWEL_SPELL_TYPE.STUN:
        console.log("stunned");
        break;
      default:
        return;
    }
  }

  private initHealthBar() {
    const margin = 30;
    const height = 40;
    const position: Coords = {
      x: this.position.x,
      y: this.position.y + this.size.height + margin,
    };
    const size: Size = {
      width: this.size.width,
      height,
    };
    return new HealthBar({
      position,
      size,
      board: this,
      player: this.player,
    });
  }

  private compareTypes(type1: number, type2: number) {
    if (type1 === 0 || type2 === 0) {
      return false;
    }
    if (type1 < 7 && type2 < 7) {
      return type1 === type2;
    }
    const converted1 = JEWEL_SPELL_CONVERSION[type1]?.parentType || type1;
    const converted2 = JEWEL_SPELL_CONVERSION[type2]?.parentType || type2;
    return converted1 === converted2;
  }

  /**
   * Move into all 4 directions simultaneously, get all matches by the plane
   * startInd - index from where we start checking process
   * advanceForward - limit check to only 2 directions up and left
   */
  private getMatchesFromPos(
    type: number,
    startInd: number,
    advanceForward = false,
  ): Matches {
    // init all 4 runners, make them next step on start
    let vertUp: number | null = startInd - this.cols;
    let vertDown: number | null = startInd + this.cols;
    let horLeft: number | null = startInd - 1;
    let horRight: number | null = startInd + 1;
    if (advanceForward) {
      horRight = null;
      vertDown = null;
    }
    const { row: startRow } = convertTo2dInd(startInd, this.rows, this.cols);
    const horMatches: number[] = [];
    const vertMatches: number[] = [];
    horMatches.unshift(startInd);
    vertMatches.unshift(startInd);

    while (
      vertUp !== null ||
      vertDown !== null ||
      horLeft !== null ||
      horRight !== null
    ) {
      if (vertUp !== null && vertUp > -1 && vertUp < this.jewels.length) {
        const jewel = this.jewels[vertUp];
        if (this.compareTypes(jewel.jewelType, type) && jewel.isMatchable()) {
          vertMatches.push(vertUp);
          vertUp = vertUp - this.cols;
        } else {
          vertUp = null;
        }
      } else {
        vertUp = null;
      }
      if (vertDown !== null && vertDown > -1 && vertDown < this.jewels.length) {
        const jewel = this.jewels[vertDown];
        if (this.compareTypes(jewel.jewelType, type) && jewel.isMatchable()) {
          vertMatches.unshift(vertDown);
          vertDown = vertDown + this.cols;
        } else {
          vertDown = null;
        }
      } else {
        vertDown = null;
      }

      if (horLeft !== null && horLeft > -1 && horLeft < this.jewels.length) {
        const { row } = convertTo2dInd(horLeft, this.rows, this.cols);
        const jewel = this.jewels[horLeft];
        if (
          this.compareTypes(jewel.jewelType, type) &&
          row === startRow &&
          jewel.isMatchable()
        ) {
          horMatches.unshift(horLeft);
          horLeft = horLeft - 1;
        } else {
          horLeft = null;
        }
      } else {
        horLeft = null;
      }
      if (horRight !== null && horRight > -1 && horRight < this.jewels.length) {
        const { row } = convertTo2dInd(horRight, this.rows, this.cols);
        const jewel = this.jewels[horRight];
        if (
          this.compareTypes(jewel.jewelType, type) &&
          row === startRow &&
          jewel.isMatchable()
        ) {
          horMatches.push(horRight);
          horRight = horRight + 1;
        } else {
          horRight = null;
        }
      } else {
        horRight = null;
      }
    }

    return {
      horMatches,
      vertMatches,
    };
  }

  private resetSwappingIndices() {
    this.selectedInd = -1;
    this.currentDraggingInd = -1;
    this.hoveredInd = -1;
  }

  swapJewels(ind1: number, ind2: number) {
    [this.jewels[ind1], this.jewels[ind2]] = [
      this.jewels[ind2],
      this.jewels[ind1],
    ];
    this.jewels[ind1].swap(this.jewels[ind2]);
  }

  removeOrMerge(matches: Matches) {
    const { horMatches, vertMatches } = matches;
    if (!this.isMatchesLegal(matches)) {
      return;
    }
    // console.log(vertMatches, horMatches);
    // if (vertMatches.length === 3 && horMatches.length === 3) {
    //   this.mergeLine([...vertMatches, ...horMatches], vertMatches[0]);
    //   return;
    // }

    if (vertMatches.length === 3) {
      this.removeLine(vertMatches);
    }
    if (horMatches.length === 3) {
      this.removeLine(horMatches);
    }
    if (vertMatches.length > 3) {
      this.mergeLine(vertMatches);
    }
    if (horMatches.length > 3) {
      this.mergeLine(horMatches);
    }
  }

  removeLine(indices: number[]) {
    indices.sort((a, b) => a - b);
    this.opponentBoard?.applyDamage(indices.length);

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      const jewel = this.jewels[currInd];
      jewel.remove();
      const removalAnim = createAnimationWithSprite(
        jewel.position,
        jewel.size,
        "jewelRemove",
      );
      removalAnim.play();

      this.animations.push(removalAnim);
    }
  }

  private findConversion(type: number, matches: number) {
    const found = Object.keys(JEWEL_SPELL_CONVERSION).find((key) => {
      const item = JEWEL_SPELL_CONVERSION[key];
      return item.parentType === type && item.matchesToGet <= matches;
    });

    return found ? +found : 0;
  }

  mergeLine(indices: number[], mergeIndex = -1) {
    indices.sort((a, b) => a - b);

    const mergeInd =
      mergeIndex > -1 ? mergeIndex : Math.floor(indices.length >> 1) - 1;
    const type = this.jewels[indices[mergeInd]].jewelType;
    const matches = indices.length;
    this.opponentBoard?.applyDamage(matches);

    const mergeTo = this.findConversion(type, matches);

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      if (i === mergeInd) {
        const jewel = this.jewels[currInd];
        jewel.convertTo(mergeTo);
        const convertAnim = createAnimationWithSprite(
          jewel.position,
          jewel.size,
          "jewelConvert",
        );
        this.animations.push(convertAnim);
        convertAnim.play();
      } else {
        this.jewels[currInd].mergeTo(
          this.jewels[indices[mergeInd]].getIndexPos(),
        );
      }
    }
  }

  attemptSwap(ind1: number, ind2: number) {
    this.shouldRevert = false;
    if (ind1 === ind2) return false;
    if (!this.jewels[ind1] || !this.jewels[ind2]) return false;

    if (!this.jewels[ind1].isSwappable() || !this.jewels[ind2].isSwappable()) {
      return false;
    }
    const { col: ind1Col, row: ind1Row } = convertTo2dInd(
      ind1,
      this.rows,
      this.cols,
    );
    const { col: ind2Col, row: ind2Row } = convertTo2dInd(
      ind2,
      this.rows,
      this.cols,
    );
    if (ind1Col !== ind2Col && ind1Row !== ind2Row) return false;
    const rowDelta = Math.abs(ind1Row - ind2Row);
    const colDelta = Math.abs(ind1Col - ind2Col);
    if (ind1Col === ind2Col && rowDelta > 1) return false;
    if (ind1Row === ind2Row && colDelta > 1) return false;
    this.swapJewels(ind1, ind2);
    const matches1 = this.filterCollapsingMatches(
      this.getMatchesFromPos(this.jewels[ind1].jewelType, ind1),
    );
    const matches2 = this.filterCollapsingMatches(
      this.getMatchesFromPos(this.jewels[ind2].jewelType, ind2),
    );

    if (!this.isMatchesLegal(matches1) && !this.isMatchesLegal(matches2)) {
      this.shouldRevert = true;
      return false;
    }
    this.currentSwapping = this.jewels[ind2];

    return true;
  }

  private filterCollapsingMatches(matches: Matches): Matches {
    let vertMatches = matches.vertMatches;
    let horMatches = matches.horMatches;
    if (vertMatches.length >= 3) {
      if (this.isCollapsingUnder(vertMatches[0])) {
        vertMatches = [];
      }
    }
    if (horMatches.length >= 3) {
      for (let i = 0; i < horMatches.length; i++) {
        if (this.isCollapsingUnder(horMatches[i])) {
          horMatches = [];
          break;
        }
      }
    }
    return {
      vertMatches,
      horMatches,
    };
  }

  // check if current jewel is on the column that is collapsing underneath
  private isCollapsingUnder(ind: number) {
    let currentInd = ind + this.cols;
    while (currentInd < this.jewels.length) {
      const jewel = this.jewels[currentInd];
      if (jewel.isRemoving || jewel.isMerging || jewel.isDisabled) {
        return true;
      }
      currentInd += this.cols;
    }
    return false;
  }

  private isMatchesLegal(matches: Matches) {
    if (matches.horMatches.length < 3 && matches.vertMatches.length < 3) {
      return false;
    }
    return true;
  }

  removeOrMergeMatches() {
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      const jewel = this.jewels[i];
      const matches = this.getMatchesFromPos(jewel.jewelType, i);
      this.removeOrMerge(matches);
    }
  }

  private moveLineDown(startInd: number) {
    //start swapping element from bottom up in order

    let elementInd = startInd - this.cols;
    while (startInd >= 0 && elementInd >= 0) {
      const el1 = this.jewels[startInd];
      const el2 = this.jewels[elementInd];

      if (el2.isMerging || el2.isSwapping) break;

      if (el1.jewelType === 0 && el2.jewelType !== 0) {
        // swap elements
        this.jewels[elementInd].index = startInd;
        this.jewels[elementInd].setFalling(
          this.jewels[elementInd].getIndexPos(),
        );
        this.indicesToFall.push(startInd);
        [this.jewels[startInd], this.jewels[elementInd]] = [
          this.jewels[elementInd],
          this.jewels[startInd],
        ];

        // advance both indices one row higher
        startInd = startInd - this.cols;
        elementInd = elementInd - this.cols;
      } else {
        // advance only second index
        elementInd = elementInd - this.cols;
      }
    }
    this.isReadyToRefill = true;
  }

  moveJewelsDown() {
    // find deepest empty spot
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      if (this.jewels[i].jewelType === 0) {
        this.moveLineDown(i);
      }
    }
  }

  private updateDragging(mousePos: Coords) {
    if (this.currentDraggingInd < 0) return;
    this.jewels[this.currentDraggingInd].dragTo(mousePos);
  }

  mouseDown(mousePos: Coords) {
    if (this.hoveredInd > -1) {
      const currJewel = this.jewels[this.hoveredInd];
      currJewel.mouseDown(mousePos);
      currJewel.resetMouseStates();
      currJewel.setDragging(true);
      this.currentDraggingInd = this.hoveredInd;
    }
  }

  private resetDragging() {
    if (this.currentDraggingInd > -1) {
      const currentDragging = this.jewels[this.currentDraggingInd];
      currentDragging.setDragging(false);
      if (!currentDragging.isMerging) {
        currentDragging.moveToIndPos();
      }
    }
    if (this.selectedInd > -1) {
      const otherJewel = this.jewels[this.selectedInd];

      otherJewel.moveTo(otherJewel.getIndexPos());
    }
    this.resetSwappingIndices();
  }

  mouseUp(_mousePos: Coords) {
    if (this.selectedInd === this.currentDraggingInd || this.selectedInd < 0) {
      this.resetDragging();
    }

    if (this.selectedInd > -1) {
      const isSuccess = this.attemptSwap(
        this.selectedInd,
        this.currentDraggingInd,
      );
      if (!isSuccess) {
        if (this.shouldRevert) {
          this.swapJewels(this.selectedInd, this.currentDraggingInd);
        }
      } else {
        this.selectedInd = -1;
      }
      this.resetDragging();

      return;
    }
  }

  mouseOut(mousePos: Coords) {
    this.mouseUp(mousePos);
  }

  mouseMove(mousePos: Coords) {
    this.updateDragging(mousePos);
    if (
      this.hoveredInd > -1 &&
      this.jewels[this.hoveredInd].checkIsHovered(mousePos)
    ) {
      return;
    }

    if (!detectCollision(this.position, this.size, mousePos, MOUSE_SIZE)) {
      return;
    }
    this.hoveredInd = -1;
    for (let i = 0; i < this.jewels.length; i++) {
      const curr = this.jewels[i];
      if (curr.checkIsHovered(mousePos)) {
        this.hoveredInd = i;
        return;
      }
    }
  }

  checkCollision() {
    for (let i = 0; i < this.jewels.length; i++) {
      const jewel1 = this.jewels[i];
      jewel1.checkWallCollision();
      for (let j = 0; j < this.jewels.length; j++) {
        const currJewel = this.jewels[j];

        if (jewel1 !== currJewel) {
          jewel1.checkCollision(currJewel);
        }

        if (jewel1.isDragging && jewel1 !== currJewel) {
          if (jewel1.checkDraggingCollision(currJewel)) {
            const currentDraggingPos = jewel1.getIndexPos();
            if (
              currJewel.targetPosition.x !== currentDraggingPos.x ||
              currentDraggingPos.y !== currJewel.targetPosition.y
            ) {
              currJewel.moveTo(currentDraggingPos);
              this.selectedInd = j;
            } else {
              currJewel.moveToIndPos();
              this.selectedInd = this.currentDraggingInd;
            }
          }
        }
      }
    }
  }

  // private updateRemoving() {
  //   for (let i = 0; i < this.indicesToRemove.length; i++) {
  //     const pack = this.indicesToRemove[i].filter(
  //       (ind) => !this.jewels[ind].isDisabled,
  //     );
  //     if (!pack.length) {
  //       this.indicesToRemove[i] = [];
  //       this.moveJewelsDown();
  //     }
  //   }
  //   this.indicesToRemove = this.indicesToRemove.filter((item) => item.length);
  //   console.log(this.indicesToRemove);
  // }

  private createJewel(
    i: number,
    type: number,
    totalRows: number,
    isPhysicalized: boolean,
  ) {
    const { row, col } = convertTo2dInd(i, this.rows, this.cols);
    const x = this.position.x + this.jewelSize.width * col;
    const jewelPos: Coords = {
      x,
      y:
        this.position.y -
        this.jewelSize.height * (totalRows - row + 1) -
        (isPhysicalized ? Math.random() * 10 : 0),
    };
    const jewel = new Jewel({
      size: { ...this.jewelSize },
      position: jewelPos,
      jewelType: type,
      boardPos: this.position,
      boardSize: this.size,
      boardCols: this.cols,
      boardRows: this.rows,
      index: i,
    });

    jewel.setFalling(
      { x, y: this.position.y + this.jewelSize.height * row },
      isPhysicalized,
    );
    return jewel;
  }

  private getTotalRows(layout: number[]) {
    for (let i = layout.length - 1; i >= 0; i--) {
      if (layout[i] !== -1) {
        const { row } = convertTo2dInd(i, this.rows, this.cols);
        return row;
      }
    }
    return layout.length - 1;
  }

  generateJewels(layout: number[], isGameStart = false) {
    const totalRows = this.getTotalRows(layout);
    for (let i = 0; i < layout.length; i++) {
      const currType = layout[i];
      if (currType < 1) continue;
      const jewel = this.createJewel(i, currType, totalRows, isGameStart);
      this.indicesToFall.push(i);
      this.jewels[i] = jewel;
    }
    this.isFalling = true;
  }

  private updateFalling() {
    for (let i = 0; i < this.indicesToFall.length; i++) {
      const jewel = this.jewels[this.indicesToFall[i]];
      if (jewel && !jewel.isFalling) {
        this.indicesToFall[i] = -1;
        this.removeOrMerge(
          this.getMatchesFromPos(jewel.jewelType, jewel.index),
        );
      }
    }

    this.indicesToFall = this.indicesToFall.filter((item) => item !== -1);
    if (!this.indicesToFall.length) {
      this.isFalling = false;
      // this.removeOrMergeMatches();
    }
  }

  private updateAnimations(t: number, dt: number) {
    let endedAnimationExists = false;
    for (let i = 0; i < this.animations.length; i++) {
      const anim = this.animations[i];
      anim.update(t, dt);
      endedAnimationExists = !anim.isAnimating;
    }
    if (endedAnimationExists) {
      this.animations = this.animations.filter((anim) => anim.isAnimating);
    }
  }

  update(t: number, dt: number) {
    this.t = t;
    if (this.currentSwapping && !this.currentSwapping.isSwapping) {
      this.currentSwapping = undefined;
      this.removeOrMergeMatches();
    }
    let disabledExist = false;
    for (let i = 0; i < this.jewels.length; i++) {
      const jewel = this.jewels[i];
      jewel.update(t, dt);

      if (jewel.isDisabled) {
        disabledExist = true;
      }
    }
    this.updateAnimations(t, dt);
    this.checkCollision();

    this.healthBar.update(t, dt);

    if (this.isFalling) {
      this.updateFalling();
    }

    if (disabledExist) {
      this.moveJewelsDown();
    }
  }

  private drawAnimations(ctx: CanvasRenderingContext2D) {
    for (let anim of this.animations) {
      anim.draw(ctx);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let draggingEnt: Jewel | undefined;
    let convertingEnt: Jewel | undefined;
    ctx.fillStyle = "black";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.healthBar.draw(ctx);
    for (let jewelEnt of this.jewels) {
      if (jewelEnt.isDragging) {
        draggingEnt = jewelEnt;
      } else if (jewelEnt.isConverting) {
        convertingEnt = jewelEnt;
      } else {
        jewelEnt.draw(ctx);
      }
    }
    if (convertingEnt) {
      convertingEnt.draw(ctx);
    }
    if (draggingEnt) {
      draggingEnt.draw(ctx);
    }
    this.drawAnimations(ctx);
  }
}
