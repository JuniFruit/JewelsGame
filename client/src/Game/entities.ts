import { JEWEL_TYPE_TO_COLOR, MOUSE_SIZE } from "./config";
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
  isMoving = false;
  isFalling = false;
  board: Board;
  boardBot: number = 0;
  boardRight: number = 0;
  fallingVec: Vector;
  physStartT: number = 0;
  dt = 0;
  bounce = -0.3;
  min_acceleration = 0.1;
  constructor({ size, position, jewelType, board }: JewelProps) {
    super({ size, position, type: "jewel" });
    this.jewelType = jewelType;
    this.board = board;
    this.fallingVec = new Vector({ x: 0, y: 2 });
    this.boardBot = board.position.y + board.size.height;
    this.boardRight = board.position.x + board.size.width;
  }

  checkCollision(otherJewel: Jewel) {
    if (
      this.position.y + this.size.height >= otherJewel.position.y &&
      this.position.x === otherJewel.position.x
    ) {
      this.bounceOff(otherJewel);
    }
  }

  bounceOff(otherJewel: Jewel) {
    this.position.y = otherJewel.position.y - this.size.height;
    this.fallingVec.y *= this.bounce;
    otherJewel.fallingVec.y *= -0.2;
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
    this.physStartT = t;
  }

  private updateFalling(t: number, dt: number) {
    this.fallingVec.y += GRAVITY_VEC.y;
    this.position.y += this.fallingVec.y * dt;
    if (t - this.physStartT > 5) {
      this.isFalling = false;
    }
  }
  update(t: number, dt: number) {
    if (this.isFalling) {
      this.updateFalling(t, dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
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

  constructor({ position, size, cols, rows }: BoardProps) {
    super({ position, size, type: "board" });
    this.cols = cols;
    this.rows = rows;
  }

  setLayout(layout: number[]) {
    this.layout = layout;
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
