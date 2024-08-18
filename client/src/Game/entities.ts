import {
  JEWEL_CONVERSION_MAP,
  JEWEL_TYPE_TO_COLOR,
  MOUSE_SIZE,
} from "./config";
import { Matches } from "./Game";
import { convertTo2dInd, detectCollision, GRAVITY_VEC, Vector } from "./utils";

export type Coords = {
  x: number;
  y: number;
};
export type Size = {
  width: number;
  height: number;
};

export type BaseEntityProps = {
  type: string;
  position: Coords;
  size: Size;
};

export class BaseEntity {
  type: string;
  position: Coords;
  size: Size;
  initialPos: Coords;
  initialSize: Size;

  constructor({ type, position, size }: BaseEntityProps) {
    this.type = type;
    this.size = size;
    this.position = position;
    this.initialPos = { ...position };
    this.initialSize = { ...size };
  }
}

export class InteractableEntity extends BaseEntity {
  isHovered = false;
  isClicking = false;

  constructor({ type, position, size }: BaseEntityProps) {
    super({ type, position, size });
  }

  checkIsHovered(mousePos: Coords) {
    const isColliding = detectCollision(
      mousePos,
      MOUSE_SIZE,
      this.position,
      this.size,
    );
    this.isHovered = isColliding;
    return isColliding;
  }

  mouseDown() {
    this.isClicking = true;
  }
  mouseUp() {
    this.isClicking = false;
  }
}

export type JewelProps = Omit<BaseEntityProps, "type"> & {
  jewelType: number;
  board: Board;
};

export class Jewel extends InteractableEntity {
  jewelType: number;
  targetJewelType: number = 0; // temp var for conversion animation
  board: Board;
  boardBot: number = 0;
  boardRight: number = 0;
  physStartT: number = 0;
  movingAnimLeft: number = 0;
  convertAnimTime: number = 0;
  removeAnimTime: number = 0;
  fallingAnimTime: number = 0;
  opacity: number = 1; // for debbugging, most likely to be removed
  // vecs
  fallingVec: Vector;
  targetPosition: Coords;
  newPosDir: Coords = { x: 1, y: 1 }; // direction of moving
  movingVec: Vector = new Vector({ x: 0, y: 0 });
  // constants
  movingVelFactor = 8;
  fallingTimeSim = 3; // in seconds
  bounce = -0.2;
  // states
  isMoving = false;
  isFalling = false;
  isPhysicalized = false;
  isSelected = false;
  isConverting = false;
  isRemoving = false;
  constructor({ size, position, jewelType, board }: JewelProps) {
    super({ size, position, type: "jewel" });
    this.jewelType = jewelType;
    this.board = board;
    this.fallingVec = new Vector({ x: 0, y: 2 });
    this.boardBot = board.position.y + board.size.height;
    this.boardRight = board.position.x + board.size.width;
    this.targetPosition = position;
  }

  private reset() {
    this.isPhysicalized = false;
    this.isMoving = false;
    this.isHovered = false;
    this.isSelected = false;
    this.isClicking = false;
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

  moveTo(pos: Coords) {
    this.reset();
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

  setFalling(targetPos: Coords) {
    this.reset();
    this.isFalling = true;
    this.targetPosition = targetPos;
    this.fallingAnimTime = this.fallingTimeSim;
    this.isPhysicalized = true;
  }

  checkIsHovered(mousePos: Coords): boolean {
    if (this.isPhysicalized || this.isMoving) {
      return false;
    }
    return super.checkIsHovered(mousePos);
  }

  convertTo(targetType: number) {
    this.reset();
    this.isConverting = true;
    this.convertAnimTime = 1;
    this.targetJewelType = targetType;
  }

  remove() {
    this.isRemoving = true;
    this.removeAnimTime = 2;
  }

  private stopMoving() {
    this.isMoving = false;
    this.position = this.targetPosition;
    this.movingVec.reset();
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
    this.convertAnimTime - dt;
    if (this.convertAnimTime > 0) {
      this.jewelType = this.jewelType === 1 ? 2 : 1;
    }
    if (this.convertAnimTime <= 0) {
      this.stopConverting();
    }
  }

  private updateRemoving(_t: number, dt: number) {
    this.removeAnimTime -= dt;
    if (this.removeAnimTime <= 0) {
      this.isRemoving = false;
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
    if (this.isRemoving) {
      this.updateRemoving(t, dt);
    }
    if (this.isConverting) {
      this.updateConverting(t, dt);
    }
    if (this.isMoving) {
      this.updateMoving(t, dt);
    }
    if (this.isFalling) {
      this.updateFalling(t, dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isHovered && !this.isSelected) {
      ctx.lineWidth = 10;
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
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    ); // Add a rectangle to the current path
  }
}

export type BoardProps = Omit<BaseEntityProps, "type"> & {
  cols: number;
  rows: number;
};

export class Board extends BaseEntity {
  layout: number[] = [];
  cols = 0;
  rows = 0;
  jewels: Jewel[] = [];
  t = 0;
  hoveredInd = -1;
  selectedInd = -1;
  jewelSize: Size;
  currentSwappingJewel1: Jewel | undefined;
  currentSwappingJewel2: Jewel | undefined;
  boardState = "";

  constructor({ position, size, cols, rows }: BoardProps) {
    super({ position, size, type: "board" });
    this.cols = cols;
    this.rows = rows;
    this.jewelSize = {
      width: this.size.width / this.cols,
      height: this.size.height / this.rows,
    };
  }

  setLayout(layout: number[]) {
    this.layout = layout;
  }

  mouseDown() {
    if (this.hoveredInd > -1) {
      this.jewels[this.hoveredInd].mouseDown();
    }
  }

  /**
   * Move into all 4 directions simultaneously, get all matches by the plane
   * newInd is the index we want our type to be after swap, initialInd where we make swap from
   *
   */
  getMatchesFromPos(type: number, newInd: number, initialInd: number): Matches {
    // init all 4 runners, make them next step on start
    let vertUp: number | null = newInd - this.cols;
    let vertDown: number | null = newInd + this.cols;
    let horLeft: number | null = newInd - 1;
    let horRight: number | null = newInd + 1;
    const { row: startRow } = convertTo2dInd(newInd, this.rows, this.cols);
    const horMatches: number[] = [];
    const vertMatches: number[] = [];

    while (
      vertUp !== null ||
      vertDown !== null ||
      horLeft !== null ||
      horRight !== null
    ) {
      if (
        vertUp !== initialInd &&
        vertUp !== null &&
        vertUp > -1 &&
        vertUp < this.layout.length
      ) {
        if (this.layout[vertUp] === type) {
          vertMatches.push(vertUp);
          vertUp = vertUp - this.cols;
        } else {
          vertUp = null;
        }
      } else {
        vertUp = null;
      }
      if (
        vertDown !== initialInd &&
        vertDown !== null &&
        vertDown > -1 &&
        vertDown < this.layout.length
      ) {
        if (this.layout[vertDown] === type) {
          vertMatches.unshift(vertDown);
          vertDown = vertDown + this.cols;
        } else {
          vertDown = null;
        }
      } else {
        vertDown = null;
      }

      if (
        horLeft !== initialInd &&
        horLeft !== null &&
        horLeft > -1 &&
        horLeft < this.layout.length
      ) {
        const { row } = convertTo2dInd(horLeft, this.rows, this.cols);

        if (this.layout[horLeft] === type && row === startRow) {
          horMatches.unshift(horLeft);
          horLeft = horLeft - 1;
        } else {
          horLeft = null;
        }
      } else {
        horLeft = null;
      }
      if (
        horRight !== initialInd &&
        horRight !== null &&
        horRight > -1 &&
        horRight < this.layout.length
      ) {
        const { row } = convertTo2dInd(horRight, this.rows, this.cols);

        if (this.layout[horRight] === type && row === startRow) {
          horMatches.push(horRight);
          horRight = horRight + 1;
        } else {
          horRight = null;
        }
      } else {
        horRight = null;
      }
    }
    horMatches.unshift(newInd);
    vertMatches.unshift(newInd);
    console.log(horMatches, vertMatches);

    return {
      horMatches,
      vertMatches,
    };
  }

  swapJewels(ind1: number, ind2: number) {
    [this.layout[ind1], this.layout[ind2]] = [
      this.layout[ind2],
      this.layout[ind1],
    ];
    [this.jewels[ind1], this.jewels[ind2]] = [
      this.jewels[ind2],
      this.jewels[ind1],
    ];
    this.jewels[ind1].moveTo({ ...this.jewels[ind2].position });
    this.jewels[ind2].moveTo({ ...this.jewels[ind1].position });
    this.currentSwappingJewel1 = this.jewels[ind1];
    this.currentSwappingJewel2 = this.jewels[ind2];
    this.boardState = "swapping";
    this.selectedInd = -1;
    this.hoveredInd = -1;
  }

  removeOrMerge(matches: Matches) {
    const { horMatches, vertMatches } = matches;
    if (vertMatches.length < 3 && horMatches.length < 3) {
      return;
    }
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
    console.log("removeLine", { indices });

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      this.layout[currInd] = 0;
      this.jewels[currInd].remove();
    }
  }

  private findConversion(type: number, matches: number) {
    const conversionCandidates = JEWEL_CONVERSION_MAP[type] || 0;

    for (let i = conversionCandidates.length - 1; i > -1; i--) {
      const [newType, requiredMatches] = conversionCandidates[i];
      if (requiredMatches <= matches) {
        return newType;
      }
    }
    return 0;
  }

  mergeLine(indices: number[]) {
    indices.sort((a, b) => a - b);

    const mergeInd = Math.floor(indices.length >> 1);
    const type = this.layout[indices[0]];
    const matches = indices.length;
    const mergeTo = this.findConversion(type, matches);
    console.log("merge", {
      mergeInd,
      type,
      mergeTo,
      indices,
      ind: indices[mergeInd],
    });
    console.log({ l: [...this.layout] });
    console.log({ ...this.jewels[indices[mergeInd]].position });

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      if (i === mergeInd) {
        this.layout[currInd] = mergeTo;
        this.jewels[currInd].convertTo(mergeTo);
      } else {
        this.layout[currInd] = 0;
        this.jewels[currInd].moveTo(
          this.jewels[indices[mergeInd]].targetPosition,
        );
      }
    }
  }

  attemptSwap(ind1: number, ind2: number) {
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
    const matches1 = this.getMatchesFromPos(this.layout[ind1], ind2, ind1);
    const { horMatches: horMatches1, vertMatches: vertMatches1 } = matches1;
    const matches2 = this.getMatchesFromPos(this.layout[ind2], ind1, ind2);
    const { horMatches: horMatches2, vertMatches: vertMatches2 } = matches2;
    if (
      horMatches1.length < 3 &&
      vertMatches1.length < 3 &&
      horMatches2.length < 3 &&
      vertMatches2.length < 3
    ) {
      return false;
    }
    this.swapJewels(ind1, ind2);
    // this.removeOrMerge(matches1);
    // this.removeOrMerge(matches2);

    return true;
  }

  recalculateLayout() {
    this.moveJewelsDown();
    // this.getAllMatches();
    // this.removeOrMerge();
  }

  private moveJewelsDown() {
    // find deepest empty spot
    let startInd = -1;
    for (let i = this.layout.length - 1; i >= 0; i--) {
      if (this.layout[i] === 0) {
        startInd = i;
        break;
      }
    }
    //start swapping element from bottom up in order
    for (let i = startInd; i >= 0; i -= this.cols) {
      for (let j = i - this.cols; j >= 0; j -= this.cols) {}
    }
    let elementInd = startInd - this.cols;
    while (startInd >= 0 && elementInd >= 0) {
      const el1 = this.layout[startInd];
      const el2 = this.layout[elementInd];

      if (el1 === 0 && el2 !== 0) {
        // swap elements
        [this.layout[startInd], this.layout[elementInd]] = [
          this.layout[elementInd],
          this.layout[startInd],
        ];
        const { row, col } = convertTo2dInd(startInd, this.rows, this.cols);
        const x = this.position.x + this.jewelSize.width * col;
        const y = this.position.y + this.jewelSize.height * row;
        const targetPos: Coords = { x, y };
        this.jewels[elementInd].setFalling(targetPos);
        // advance both indices one row higher
        startInd = startInd - this.cols;
        elementInd = elementInd - this.cols;
      } else {
        //advance only second index
        elementInd = elementInd - this.cols;
      }
    }
  }

  private selectCurrent(ind: number) {
    this.selectedInd = ind;
    this.jewels[this.selectedInd].setSelected(true);
  }

  mouseUp() {
    if (this.hoveredInd < 0 && this.selectedInd > -1) {
      // that means we clicked outside
      this.jewels[this.selectedInd].setSelected(false);
      this.selectedInd = -1;
      return;
    }
    if (this.selectedInd > -1 && this.hoveredInd > -1) {
      const isSuccess = this.attemptSwap(this.selectedInd, this.hoveredInd);
      console.log(this.selectedInd, this.hoveredInd, isSuccess);
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

  private updateSwapping(t: number, dt: number) {
    this.currentSwappingJewel1?.update(t, dt);
    this.currentSwappingJewel2?.update(t, dt);
    if (
      !this.currentSwappingJewel1?.isMoving &&
      !this.currentSwappingJewel2?.isMoving
    ) {
      this.currentSwappingJewel1 = undefined;
      this.currentSwappingJewel2 = undefined;

      this.boardState = "removing";
    }
  }

  private updateRemoving(t: number, dt: number) {}

  update(t: number, dt: number) {
    this.t = t;
    // switch (this.boardState) {
    //   case "swapping":
    //     this.updateSwapping(t, dt);
    //     break;
    // }
    for (let i = 0; i < this.jewels.length; i++) {
      this.jewels[i].update(t, dt);
    }
    this.checkCollision();
  }

  generateJewels() {
    for (let i = 0; i < this.layout.length; i++) {
      const currType = this.layout[i];
      const { row, col } = convertTo2dInd(i, this.rows, this.cols);
      const x = this.position.x + this.jewelSize.width * col;

      const jewelPos: Coords = {
        x,
        y:
          this.position.y -
          this.size.height / 1.5 -
          Math.random() * 10 +
          this.jewelSize.height * row,
      };

      const jewel = new Jewel({
        size: this.jewelSize,
        position: jewelPos,
        jewelType: currType,
        board: this,
      });

      jewel.setFalling({ x, y: this.position.y + this.jewelSize.height * row });
      this.jewels[i] = jewel;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    for (let jewelEnt of this.jewels) {
      jewelEnt.draw(ctx);
    }
  }
}
