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
  newPos: Coords = { x: 0, y: 0 };
  newPosDir: Coords = { x: 1, y: 1 }; // direction of moving
  movingVec: Vector = new Vector({ x: 0, y: 0 });
  movingVelFactor = 5;
  isMoving = false;
  isFalling = false;
  board: Board;
  boardBot: number = 0;
  boardRight: number = 0;
  fallingVec: Vector;
  physStartT: number = 0;
  isPhysicalized = false;
  isSelected = false;
  dt = 0;
  fallingTimeSim = 3; // in seconds
  bounce = -0.2;
  constructor({ size, position, jewelType, board }: JewelProps) {
    super({ size, position, type: "jewel" });
    this.jewelType = jewelType;
    this.board = board;
    this.fallingVec = new Vector({ x: 0, y: 2 });
    this.boardBot = board.position.y + board.size.height;
    this.boardRight = board.position.x + board.size.width;
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
    this.isSelected = false;
    this.isHovered = false;
    this.isFalling = false;
    this.isPhysicalized = false;
    this.isMoving = true;
    this.newPos = pos;
    this.newPosDir.x = pos.x - this.position.x < 0 ? -1 : 1;
    this.newPosDir.y = pos.y - this.position.y < 0 ? -1 : 1;
    const dx = Math.abs(pos.x - this.position.x);
    const dy = Math.abs(pos.y - this.position.y);
    this.movingVec.x = dx * this.movingVelFactor;
    this.movingVec.y = dy * this.movingVelFactor;
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

  setFalling(t: number, val = true) {
    this.isFalling = val;
    this.isPhysicalized = true;
    this.physStartT = t;
  }

  checkIsHovered(mousePos: Coords): boolean {
    if (this.isPhysicalized || this.isMoving) {
      return false;
    }
    return super.checkIsHovered(mousePos);
  }

  private stopMoving() {
    this.isMoving = false;
    this.position = this.newPos;
    this.newPos = { x: 0, y: 0 };
  }

  private stopFalling() {
    this.isFalling = false;
    this.isPhysicalized = false;
  }

  private updateFalling(t: number, dt: number) {
    this.fallingVec.y += GRAVITY_VEC.y;
    this.position.y += this.fallingVec.y * dt;
    if (t - this.physStartT > this.fallingTimeSim) {
      this.stopFalling();
    }
  }

  private updateMoving(_t: number, dt: number) {
    const dx = Math.abs(this.newPos.x - this.position.x);
    const factor = 0.5;
    if (dx > factor) {
      this.position.x += this.movingVec.x * this.newPosDir.x * dt;
    }
    const dy = Math.abs(this.newPos.y - this.position.y);
    if (dy > factor) {
      this.position.y += this.movingVec.y * this.newPosDir.y;
    }
    if (dx < factor && dy < factor) {
      this.stopMoving();
    }
  }
  update(t: number, dt: number) {
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

  constructor({ position, size, cols, rows }: BoardProps) {
    super({ position, size, type: "board" });
    this.cols = cols;
    this.rows = rows;
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

  /**
   * Check matches by specified direction
   * return arr of indices with matches
   */
  // private chechMatchesByDir(
  //   startInd: number,
  //   dir: "u" | "d" | "l" | "r",
  //   type: number,
  // ) {
  //   let prevInd = startInd;
  //   const result: number[] = [];
  //
  //   while (prevInd > -1 && prevInd < this.layout.length) {
  //     let curr = 0;
  //     let nextInd = -1;
  //     if (dir === "u") {
  //       nextInd = prevInd - this.cols;
  //       curr = this.layout[nextInd];
  //     }
  //     if (dir === "d") {
  //       nextInd = prevInd + this.cols;
  //       curr = this.layout[nextInd];
  //     }
  //     if (dir === "l") {
  //       nextInd = prevInd - 1;
  //       curr = this.layout[nextInd];
  //     }
  //     if (dir === "r") {
  //       nextInd = prevInd + 1;
  //       curr = this.layout[nextInd];
  //     }
  //
  //     if (curr === type) {
  //       result.push(nextInd);
  //     } else {
  //       break;
  //     }
  //     prevInd = nextInd;
  //   }
  //
  //   return result;
  // }

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
  }
  animateSwap(ind1: number, ind2: number) {}
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
    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      this.layout[currInd] = 0;
    }
  }

  private findConversion(type: number, matches: number) {
    const conversionCandidates = JEWEL_CONVERSION_MAP[type];

    for (let i = conversionCandidates.length - 1; i > -1; i--) {
      const [newType, requiredMatches] = conversionCandidates[i];
      if (requiredMatches <= matches) {
        return newType;
      }
    }
    return 0;
  }

  mergeLine(indices: number[]) {
    const mergeInd = Math.floor(indices.length >> 1);
    const type = this.layout[indices[0]];
    const matches = indices.length;
    const mergeTo = this.findConversion(type, matches);
    for (let i = 0; i < indices.length; i++) {
      if (i === mergeInd) {
        this.layout[indices[i]] = mergeTo;
      } else {
        this.layout[indices[i]] = 0;
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
    console.log({ ind1, ind2, len: this.layout.length });
    const { horMatches: horMatches1, vertMatches: vertMatches1 } =
      this.getMatchesFromPos(this.layout[ind1], ind2, ind1);
    const { horMatches: horMatches2, vertMatches: vertMatches2 } =
      this.getMatchesFromPos(this.layout[ind2], ind1, ind2);
    if (
      horMatches1.length < 3 &&
      vertMatches1.length < 3 &&
      horMatches2.length < 3 &&
      vertMatches2.length < 3
    ) {
      return false;
    }
    console.log("attemt");
    this.swapJewels(ind1, ind2);
    return true;
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

  update(t: number, dt: number) {
    this.t = t;
    for (let i = 0; i < this.jewels.length; i++) {
      this.jewels[i].update(t, dt);
    }
    this.checkCollision();
  }

  generateJewels() {
    const jewelSize: Size = {
      width: this.size.width / this.cols,
      height: this.size.height / this.rows,
    };

    for (let i = 0; i < this.layout.length; i++) {
      const currType = this.layout[i];
      const { row, col } = convertTo2dInd(i, this.rows, this.cols);
      const jewelPos: Coords = {
        x: this.position.x + jewelSize.width * col,
        y:
          this.position.y -
          this.size.height / 1.5 -
          Math.random() * 10 +
          jewelSize.height * row,
      };

      const jewel = new Jewel({
        size: jewelSize,
        position: jewelPos,
        jewelType: currType,
        board: this,
      });

      jewel.setFalling(this.t);
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
