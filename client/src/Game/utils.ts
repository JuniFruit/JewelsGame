/**
 * General utils including math utils
 */

import { BOARD_COLS, BOARD_ROWS, JEWEL_TYPE } from "./config";
import { Coords, Size } from "./entities";
import { Game } from "./Game";

export function convertTo2dInd(ind: number, rows: number, cols: number) {
  const row = Math.floor(ind / rows);
  const col = ind % cols;

  return {
    row,
    col,
  };
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
    const len = this.getLength();
    this.x = Math.cos(angle) * len;
    this.y = Math.sin(angle) * len;
  }
  getAngle() {
    return Math.atan2(this.x, this.y);
  }
  setLength(len: number) {
    const angle = this.getAngle();
    this.x = Math.cos(angle) * len;
    this.y = Math.sin(angle) * len;
  }
  getLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
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

export class Debug {
  game: Game;
  fps = 0;
  ctx: CanvasRenderingContext2D;
  mouseX = 0;
  mouseY = 0;
  canvasW = 0;
  canvasH = 0;
  secondsPassed = 0;
  timePassed = 0;
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
      1, 6, 6, 6, 7, 6, 7, 8, 1, 3, 4, 5, 6, 7, 8, 9, 2, 1, 5, 6, 7, 3, 9, 2, 1,
      1, 5, 4, 7, 3, 8, 2, 4, 3, 7, 7, 3, 7, 3, 3, 5, 1, 3, 5, 8, 8, 3, 2, 7, 7,
      2, 3, 3, 1, 4, 5, 1, 4, 6, 2, 4, 5, 8, 7,
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
      layout[i] = types[Math.floor(Math.random() * types.length)];
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

  showDebug() {
    this.ctx.font = this.rectFont;
    this.ctx.fillStyle = this.rectFillStyle;
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
  }
}

export const GRAVITY_VEC = new Vector({ x: 0, y: 9.8 });
