import {
  JEWEL_SPELL_CONVERSION,
  JEWEL_TYPE,
  JEWEL_TYPE_TO_COLOR,
} from "./config";
import { Matches } from "./Game";
import {
  BaseEntity,
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
} from "./sharedEntities";
import { HealthBar } from "./UI";
import { convertTo2dInd, GRAVITY_VEC, Vector } from "./utils";

export type JewelProps = Omit<BaseEntityProps, "type"> & {
  jewelType: number;
  boardPos: Coords;
  boardSize: Size;
};

export class Jewel extends InteractableEntity {
  jewelType: number;
  targetJewelType: number = 0; // temp var for conversion animation
  boardBot: number = 0;
  boardRight: number = 0;
  physStartT: number = 0;
  movingAnimLeft: number = 0;
  convertAnimTime: number = 0;
  removeAnimTime: number = 0;
  fallingAnimTime: number = 0;
  opacity: number = 1; // for debbuggin, most likely to be removed
  // vecs
  fallingVec: Vector;
  targetPosition: Coords;
  newPosDir: Coords = { x: 1, y: 1 }; // direction of moving
  movingVec: Vector = new Vector({ x: 0, y: 0 });
  // constants
  movingVelFactor = 8;
  fallingTimeSim = 1; // in seconds
  bounce = -0.2;
  // states
  isSpell = false;
  isMoving = false;
  isFalling = false;
  isPhysicalized = false;
  isSelected = false;
  isConverting = false;
  isRemoving = false;
  isReadyToRecreate = false;
  isDisabled = false;
  isMerging = false;
  constructor({ size, position, jewelType, boardPos, boardSize }: JewelProps) {
    super({ size, position, type: "jewel" });
    this.jewelType = jewelType;
    this.fallingVec = new Vector({ x: 0, y: 2 });
    this.boardBot = boardPos.y + boardSize.height;
    this.boardRight = boardPos.x + boardSize.width;
    this.targetPosition = position;
  }

  disable() {
    this.reset();
    this.jewelType = 0;
    this.isDisabled = true;
  }

  private reset() {
    super.resetMouseStates();
    this.isMerging = false;
    this.isReadyToRecreate = false;
    this.isPhysicalized = false;
    this.isMoving = false;
    this.isSelected = false;
    this.isFalling = false;
    this.isConverting = false;
    this.isRemoving = false;
  }

  checkCollision(otherJewel: Jewel) {
    if (!this.isPhysicalized) return;
    if (
      this.position.y + this.size.height >= otherJewel.position.y &&
      this.position.x === otherJewel.position.x
    ) {
      this.bounceOff(otherJewel);
    }
  }

  setSelected(val: boolean) {
    this.isSelected = val;
  }

  moveTo(pos: Coords, isMerging = false) {
    // this.reset();
    super.resetMouseStates();
    this.isSelected = false;
    this.isMerging = isMerging;
    if (isMerging) {
      this.jewelType = 0;
    }
    this.isMoving = true;
    this.targetPosition = pos;
    this.newPosDir.x = pos.x - this.position.x < 0 ? -1 : 1;
    this.newPosDir.y = pos.y - this.position.y < 0 ? -1 : 1;

    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.movingVec.setLength(distance * 0.5 * this.movingVelFactor);
    this.movingVec.setAngle(angle);
    this.movingAnimLeft = distance / this.movingVec.getLength();
  }

  bounceOff(otherJewel: Jewel) {
    this.position.y = otherJewel.position.y - this.size.height;
    this.fallingVec.y *= this.bounce;
    otherJewel.fallingVec.y *= -0.1;
  }

  checkWallCollision() {
    if (this.position.y + this.size.height >= this.boardBot) {
      // bounce up
      this.position.y = this.boardBot - this.size.height;
      this.fallingVec.y *= this.bounce;
    }
  }

  setFalling(targetPos: Coords, isPhysicalized = false) {
    this.isFalling = true;
    this.targetPosition = targetPos;
    this.fallingAnimTime = this.fallingTimeSim;
    this.isPhysicalized = isPhysicalized;
    if (!isPhysicalized) {
      this.moveTo(targetPos);
    }
  }

  checkIsHovered(mousePos: Coords): boolean {
    if (
      this.isDisabled ||
      this.isMerging ||
      this.isMoving ||
      this.isPhysicalized ||
      this.isMoving
    ) {
      return false;
    }
    return super.checkIsHovered(mousePos);
  }

  convertTo(targetType: number) {
    this.reset();
    this.isSpell = true;
    this.isConverting = true;
    this.convertAnimTime = 0.5;
    this.targetJewelType = targetType;
  }

  remove() {
    this.isRemoving = true;
    this.removeAnimTime = 0.2;
  }

  private stopMoving() {
    this.isMoving = false;
    this.position = this.targetPosition;
    this.movingVec.reset();
    if (!this.isPhysicalized && this.isFalling) {
      this.stopFalling();
    }
    if (this.isMerging) {
      this.isMerging = false;
      this.disable();
    }
  }

  private stopRemoving() {
    this.isRemoving = false;
    this.disable();
  }

  private stopFalling() {
    this.isFalling = false;
    this.isPhysicalized = false;
    this.position = this.targetPosition;
  }

  private stopConverting() {
    this.isConverting = false;
    this.jewelType = this.targetJewelType;
    this.targetJewelType = 0;
  }

  private updateFalling(_t: number, dt: number) {
    this.fallingAnimTime -= dt;
    this.fallingVec.y += GRAVITY_VEC.y;
    this.position.y += this.fallingVec.y * dt;
    if (this.fallingAnimTime <= 0) {
      this.stopFalling();
    }
  }

  private updateConverting(_t: number, dt: number) {
    this.convertAnimTime -= dt;
    if (this.convertAnimTime <= 0) {
      this.stopConverting();
    }
  }

  private updateRemoving(_t: number, dt: number) {
    this.removeAnimTime -= dt;
    if (this.removeAnimTime <= 0) {
      this.stopRemoving();
    }
  }

  private updateMoving(_t: number, dt: number) {
    this.movingAnimLeft -= dt;
    if (this.movingAnimLeft > 0) {
      this.position.x += this.movingVec.x * dt;
    }
    if (this.movingAnimLeft > 0) {
      this.position.y += this.movingVec.y * dt;
    }

    if (this.movingAnimLeft <= 0) {
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
    if (this.isMoving) {
      this.updateMoving(t, dt);
    }
    if (this.isFalling && this.isPhysicalized) {
      this.updateFalling(t, dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDisabled) return;
    if (this.isHovered && !this.isSelected) {
      ctx.lineWidth = 10;
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
    ctx.fillStyle = JEWEL_TYPE_TO_COLOR[this.jewelType];
    if (this.isRemoving) {
      ctx.lineWidth = 10;

      ctx.strokeStyle = "cyan";
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height,
      );
    }
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
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
  private initialSelected1 = -1;
  private initialSelected2 = -1;
  private currentSwappingJewel1: Jewel | undefined;
  private currentSwappingJewel2: Jewel | undefined;
  private latestMatches: Matches[] = [];
  private indicesToRemove: number[] = [];
  private indicesToFall: number[] = [];
  private spellsToCast: unknown[] = []; // queue for spells to cast
  private opponentBoard: Board | undefined;
  // states
  shouldRevert = false;
  isSwapping = false;
  isFalling = false;
  isRemovingJewels = false;
  isCastingSpell = false;

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

  mouseDown() {
    if (this.hoveredInd > -1) {
      this.jewels[this.hoveredInd].mouseDown();
    }
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
   *
   */
  getMatchesFromPos(type: number, startInd: number): Matches {
    // init all 4 runners, make them next step on start
    let vertUp: number | null = startInd - this.cols;
    let vertDown: number | null = startInd + this.cols;
    let horLeft: number | null = startInd - 1;
    let horRight: number | null = startInd + 1;
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
        if (this.compareTypes(jewel.jewelType, type)) {
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
        if (this.compareTypes(jewel.jewelType, type)) {
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
        if (this.compareTypes(jewel.jewelType, type) && row === startRow) {
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
        if (this.compareTypes(jewel.jewelType, type) && row === startRow) {
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
    this.initialSelected1 = -1;
    this.initialSelected2 = -1;
    this.hoveredInd = -1;
  }

  swapJewels(ind1: number, ind2: number) {
    if (this.jewels[ind1].isRemoving || this.jewels[ind2].isRemoving) return;
    this.currentSwappingJewel1 = this.jewels[ind1];
    this.currentSwappingJewel2 = this.jewels[ind2];
    this.isSwapping = true;
    [this.jewels[ind1], this.jewels[ind2]] = [
      this.jewels[ind2],
      this.jewels[ind1],
    ];
    this.jewels[ind1].moveTo({ ...this.jewels[ind2].position });
    this.jewels[ind2].moveTo({ ...this.jewels[ind1].position });
  }

  removeOrMerge(matches: Matches) {
    const { horMatches, vertMatches } = matches;
    if (vertMatches.length < 3 && horMatches.length < 3) {
      return;
    }
    if (vertMatches.length === 3) {
      this.removeLine(vertMatches);
      this.opponentBoard?.applyDamage(1);
    }
    if (horMatches.length === 3) {
      this.removeLine(horMatches);
      this.opponentBoard?.applyDamage(1);
    }
    if (vertMatches.length > 3) {
      this.mergeLine(vertMatches);
      this.opponentBoard?.applyDamage(3);
    }
    if (horMatches.length > 3) {
      this.mergeLine(horMatches);
      this.opponentBoard?.applyDamage(3);
    }
  }

  removeLine(indices: number[]) {
    indices.sort((a, b) => a - b);
    console.log("removeLine", { indices });

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      this.jewels[currInd].remove();
      this.indicesToRemove.push(currInd);
    }
  }

  private findConversion(type: number, matches: number) {
    const found = Object.keys(JEWEL_SPELL_CONVERSION).find((key) => {
      const item = JEWEL_SPELL_CONVERSION[key];
      return item.parentType === type && item.matchesToGet <= matches;
    });

    return found ? +found : 0;
  }

  mergeLine(indices: number[]) {
    indices.sort((a, b) => a - b);

    const mergeInd = Math.floor(indices.length >> 1);
    const type = this.jewels[indices[0]].jewelType;
    const matches = indices.length;
    const mergeTo = this.findConversion(type, matches);

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      if (i === mergeInd) {
        this.jewels[currInd].convertTo(mergeTo);
      } else {
        this.jewels[currInd].moveTo(
          this.jewels[indices[mergeInd]].targetPosition,
          true,
        );
        this.indicesToRemove.push(currInd);
      }
    }
  }

  attemptSwap(ind1: number, ind2: number) {
    if (this.isRemovingJewels || this.isFalling || this.isSwapping)
      return false;
    if (ind1 === ind2) return false;
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
    this.initialSelected1 = ind1;
    this.initialSelected2 = ind2;
    this.swapJewels(ind1, ind2);
    const matches1 = this.getMatchesFromPos(this.jewels[ind1].jewelType, ind1);
    const { horMatches: horMatches1, vertMatches: vertMatches1 } = matches1;
    const matches2 = this.getMatchesFromPos(this.jewels[ind2].jewelType, ind2);
    const { horMatches: horMatches2, vertMatches: vertMatches2 } = matches2;
    if (
      horMatches1.length < 3 &&
      vertMatches1.length < 3 &&
      horMatches2.length < 3 &&
      vertMatches2.length < 3
    ) {
      this.shouldRevert = true;
      return false;
    }

    return true;
  }

  private removeOrMergeMatches() {
    // if (this.latestMatches.length) {
    //   this.isRemovingJewels = true;
    //
    //   for (let i = 0; i < this.latestMatches.length; i++) {
    //     this.removeOrMerge(this.latestMatches[i]);
    //   }
    // } else {
    // }
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      const jewel = this.jewels[i];
      const matches = this.getMatchesFromPos(jewel.jewelType, i);
      if (matches.horMatches.length >= 3 || matches.vertMatches.length >= 3) {
        this.isRemovingJewels = true;
      }
      this.removeOrMerge(matches);
    }

    this.latestMatches = [];
  }

  private moveLineDown(startInd: number) {
    //start swapping element from bottom up in order

    let elementInd = startInd - this.cols;
    while (startInd >= 0 && elementInd >= 0) {
      const el1 = this.jewels[startInd];
      const el2 = this.jewels[elementInd];

      if (el1.jewelType === 0 && el2.jewelType !== 0) {
        // swap elements
        const { row, col } = convertTo2dInd(startInd, this.rows, this.cols);
        const x = this.position.x + this.jewelSize.width * col;
        const y = this.position.y + this.jewelSize.height * row;
        const targetPos: Coords = { x, y };
        this.jewels[elementInd].setFalling(targetPos);
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
  }

  private addJewels() {
    const layout = [];
    const types = Object.values(JEWEL_TYPE);

    for (let i = 0; i < this.jewels.length; i++) {
      if (this.jewels[i].isDisabled) {
        layout[i] = types[Math.floor(Math.random() * 6)];
      } else {
        layout[i] = -1;
      }
    }
    this.generateJewels(layout);
  }

  private moveJewelsDown() {
    // find deepest empty spot
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      if (this.jewels[i].jewelType === 0) {
        this.moveLineDown(i);
      }
    }
    this.addJewels();

    this.isFalling = true;
  }

  private selectCurrent(ind: number) {
    this.selectedInd = ind;
    this.jewels[this.selectedInd].setSelected(true);
  }

  mouseUp() {
    if (this.isSwapping) return;
    if (this.hoveredInd < 0 && this.selectedInd > -1) {
      // that means we clicked outside
      this.jewels[this.selectedInd].setSelected(false);
      this.selectedInd = -1;
      return;
    }
    if (this.selectedInd > -1 && this.hoveredInd > -1) {
      const isSuccess = this.attemptSwap(this.selectedInd, this.hoveredInd);
      if (!isSuccess) {
        this.jewels[this.selectedInd].setSelected(false);
        this.selectCurrent(this.hoveredInd);
      }
      return;
    }
    if (this.hoveredInd > -1) {
      this.selectCurrent(this.hoveredInd);
    }
  }

  checkIsHovered(mousePos: Coords) {
    if (
      this.hoveredInd > -1 &&
      this.jewels[this.hoveredInd]?.checkIsHovered(mousePos)
    ) {
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
      for (let j = i + 1; j < this.jewels.length; j++) {
        jewel1.checkCollision(this.jewels[j]);
      }
    }
  }

  private revertSwap(ind1: number, ind2: number) {
    this.swapJewels(ind1, ind2);
    this.shouldRevert = false;
    this.isSwapping = true;
  }

  private updateSwapping() {
    if (
      this.currentSwappingJewel1 &&
      !this.currentSwappingJewel1.isMoving &&
      this.currentSwappingJewel2 &&
      !this.currentSwappingJewel2.isMoving
    ) {
      this.currentSwappingJewel1 = undefined;
      this.currentSwappingJewel2 = undefined;
      this.isSwapping = false;
      if (this.shouldRevert) {
        this.revertSwap(this.initialSelected1, this.initialSelected2);
      } else {
        this.removeOrMergeMatches();
      }
      this.resetSwappingIndices();
    }
  }

  private updateFalling() {
    for (let i = 0; i < this.indicesToFall.length; i++) {
      const jewel = this.jewels[this.indicesToFall[i]];
      if (jewel && !jewel.isFalling) {
        this.indicesToFall[i] = -1;
      }
    }

    this.indicesToFall = this.indicesToFall.filter((item) => item !== -1);
    if (!this.indicesToFall.length) {
      this.isFalling = false;
      this.removeOrMergeMatches();
    }
  }

  private updateRemoving() {
    for (let i = 0; i < this.indicesToRemove.length; i++) {
      const jewel = this.jewels[this.indicesToRemove[i]];
      if (jewel && jewel.isDisabled) {
        this.indicesToRemove[i] = -1;
      }
    }

    this.indicesToRemove = this.indicesToRemove.filter((item) => item !== -1);
    if (!this.indicesToRemove.length) {
      this.isRemovingJewels = false;
      this.moveJewelsDown();
    }
  }

  private createJewel(row: number, col: number, type: number) {
    const x = this.position.x + this.jewelSize.width * col;
    const jewelPos: Coords = {
      x,
      y:
        this.position.y -
        this.size.height * 0.2 -
        Math.random() * 10 +
        this.jewelSize.height * row,
    };
    const jewel = new Jewel({
      size: this.jewelSize,
      position: jewelPos,
      jewelType: type,
      boardPos: this.position,
      boardSize: this.size,
    });

    jewel.setFalling(
      { x, y: this.position.y + this.jewelSize.height * row },
      true,
    );
    return jewel;
  }

  generateJewels(layout: number[]) {
    for (let i = 0; i < layout.length; i++) {
      const currType = layout[i];
      if (currType < 1) continue;
      const { row, col } = convertTo2dInd(i, this.rows, this.cols);
      const jewel = this.createJewel(row, col, currType);
      this.indicesToFall.push(i);
      this.jewels[i] = jewel;
    }
    this.isFalling = true;
  }

  update(t: number, dt: number) {
    this.t = t;
    for (let i = 0; i < this.jewels.length; i++) {
      this.jewels[i].update(t, dt);
    }
    this.healthBar.update(t, dt);
    if (this.isSwapping) {
      this.updateSwapping();
    }

    if (this.isFalling) {
      this.updateFalling();
      this.checkCollision();
    }
    if (this.isRemovingJewels) {
      this.updateRemoving();
    }
    // console.log(
    //   `isFalling: ${this.isFalling}, isRemoving: ${this.isRemovingJewels}, isSwapping: ${this.isSwapping}`,
    // );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.healthBar.draw(ctx);
    for (let jewelEnt of this.jewels) {
      jewelEnt.draw(ctx);
    }
  }
}
