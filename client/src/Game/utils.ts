/**
 * General utils including math utils
 */

import { BOARD_COLS, BOARD_ROWS, JEWEL_TYPE } from "./config";
import { Game } from "./Game";
import { Coords, Size } from "./sharedEntities";

export function convertTo2dInd(ind: number, rows: number, cols: number) {
  const row = Math.floor(ind / rows);
  const col = ind % cols;

  return {
    row,
    col,
  };
}

export function radToDegrees(val: number) {
  console.log(val * (180 / Math.PI));
  return val * (180 / Math.PI);
}

export function getCenter(pos: Coords, size: Size): Coords {
  return {
    x: pos.x + size.width * 0.5,
    y: pos.y + size.height * 0.5,
  };
}

export function getPositionByInd(
  ind: number,
  rows: number,
  cols: number,
  boardPos: Coords,
  jewelSize: Size,
) {
  const { row, col } = convertTo2dInd(ind, rows, cols);
  const x = boardPos.x + jewelSize.width * col;
  const y = boardPos.y + jewelSize.height * row;

  return { x, y };
}

const hexTransparencyTable: Record<number, string> = {
  100: "FF",
  90: "E6",
  80: "CC",
  70: "B3",
  60: "99",
  50: "80",
  40: "66",
  30: "4D",
  20: "33",
  10: "1A",
};

export function setTransparency(hex: string, val: number) {
  const sliced = hex.slice(3);
  return `#${hexTransparencyTable[val] || "FF"}${sliced}`;
}

export type VectorProps = {
  x?: number;
  y?: number;
};

export class Vector {
  x: number;
  y: number;

  constructor({ x = 0, y = 0 }: VectorProps) {
    this.x = x;
    this.y = y;
  }
  setAngle(angle: number) {
    const length = this.getLength();
    this.y = Math.sin(angle) * length;
    this.x = Math.cos(angle) * length;
  }

  setLength(length: number) {
    const angle = this.getAngle();
    this.y = Math.sin(angle) * length;
    this.x = Math.cos(angle) * length;
  }

  getAngle() {
    return Math.atan2(this.y, this.x);
  }
  getLength() {
    return Math.sqrt(this.y ** 2 + this.x ** 2);
  }
  reset() {
    this.x = 0;
    this.y = 0;
  }
}

/**
 * collision of rectangular shapes
 */
export function detectCollision(
  pos1: Coords,
  size1: Size,
  pos2: Coords,
  size2: Size,
) {
  // Check x and y for overlap
  if (
    pos2.x > size1.width + pos1.x ||
    pos1.x > size2.width + pos2.x ||
    pos2.y > size1.height + pos1.y ||
    pos1.y > size2.height + pos2.y
  ) {
    return false;
  }
  return true;
}

export function getMovingProps(currPos: Coords, targetPos: Coords) {
  const dx = targetPos.x - currPos.x;
  const dy = targetPos.y - currPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  return { distance, angle };
}

export function pickRnd(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Debug {
  game: Game;
  fps = 0;
  ctx: CanvasRenderingContext2D;
  mouseX = 0;
  mouseY = 0;
  canvasW = 0;
  canvasH = 0;
  secondsPassed = 0;
  jewelDebug = false;
  timePassed = 0;
  isSlowTime = false;
  debugLayout: number[] = [];
  isFPSThrottling = false;
  FPSThrottle = 0.05; // ~15fps
  private rectFont = "normal 15px Arial";
  private rectFillStyle = "black";

  constructor(game: Game, ctx: CanvasRenderingContext2D) {
    this.game = game;
    this.ctx = ctx;
    const { height, width } = ctx.canvas.getBoundingClientRect();
    this.canvasH = height;
    this.canvasW = width;
    this.debugLayout = [
      1, 6, 6, 6, 5, 6, 5, 4, 1, 3, 4, 5, 6, 5, 4, 10, 2, 1, 5, 6, 5, 3, 9, 2,
      1, 1, 5, 4, 5, 3, 4, 2, 4, 3, 5, 5, 3, 5, 3, 3, 5, 1, 3, 5, 4, 4, 3, 2, 5,
      5, 2, 3, 3, 1, 4, 5, 1, 4, 6, 2, 4, 5, 4, 8,
    ];
  }

  setMouseCoords(pos: Coords) {
    this.mouseX = pos.x;
    this.mouseY = pos.y;
  }

  generateRandomTestBoard() {
    const size = BOARD_ROWS * BOARD_COLS;
    const types = Object.values(JEWEL_TYPE);
    const layout: number[] = [];
    for (let i = 0; i < size; i++) {
      layout[i] = types[Math.floor(Math.random() * 6)];
    }

    return layout;
  }

  toggleFPSThrottle() {
    this.isFPSThrottling = !this.isFPSThrottling;
  }

  setTestBoards(isRandom = true) {
    const layout = isRandom
      ? this.generateRandomTestBoard()
      : [...this.debugLayout];
    this.game.setBoard(layout, "p1");
    this.game.setBoard(layout, "p2");
  }

  update(secondsPassed: number, timePassed: number) {
    this.fps = Math.round(1 / secondsPassed);
    this.secondsPassed = secondsPassed;
    this.timePassed = timePassed;
  }

  toggleJewelsDebug() {
    this.jewelDebug = !this.jewelDebug;
  }

  slowTime() {
    this.isSlowTime = !this.isSlowTime;
  }

  showDebug() {
    if (this.jewelDebug) {
      for (let i = 0; i < this.game.p1Board.jewels.length; i++) {
        const jewel = this.game.p1Board.jewels[i];
        this.ctx.fillText(
          `${jewel.index}`,
          jewel.position.x + jewel.size.width * 0.8,
          jewel.position.y + jewel.size.height * 0.9,
        );
        this.ctx.fillText(
          `mer:${jewel.isMerging}`,
          jewel.position.x,
          jewel.position.y + 10,
        );
        this.ctx.fillText(
          `mov:${jewel.isMoving}`,
          jewel.position.x,
          jewel.position.y + 20,
        );
        this.ctx.fillText(
          `rem:${jewel.isRemoving}`,
          jewel.position.x,
          jewel.position.y + 30,
        );
        this.ctx.fillText(
          `sw:${jewel.isSwapping}`,
          jewel.position.x,
          jewel.position.y + 40,
        );
        this.ctx.fillText(
          `t:${jewel.jewelType}`,
          jewel.position.x,
          jewel.position.y + 50,
        );
      }
    }
    this.ctx.font = this.rectFont;
    this.ctx.fillStyle = this.rectFillStyle;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(0, 0, this.canvasW, this.canvasH);

    // FPS
    this.ctx.fillText("fps: " + this.fps, 10, 20);

    // Mouse coords
    this.ctx.fillText("mouseX: " + this.mouseX, 10, 35);
    this.ctx.fillText("mouseY: " + this.mouseY, 10, 50);

    // Time
    this.ctx.fillText("timePassed: " + this.timePassed, 10, 65);
    this.ctx.fillText("frameTime: " + this.secondsPassed, 10, 80);

    // Board states
    this.ctx.fillText("isFalling: " + this.game.p1Board.isFalling, 10, 110);
    this.ctx.fillText(
      "isReadyToFill: " + this.game.p1Board.isReadyToRefill,
      10,
      125,
    );
  }
}

export const GRAVITY_VEC = new Vector({ x: 0, y: 20 });
