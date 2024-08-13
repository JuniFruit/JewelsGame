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
  private rectFont = "normal 15px Arial";
  private rectFillStyle = "black";

  constructor(game: Game, ctx: CanvasRenderingContext2D) {
    this.game = game;
    this.ctx = ctx;
    const { height, width } = ctx.canvas.getBoundingClientRect();
    this.canvasH = height;
    this.canvasW = width;
  }

  setMouseCoords(pos: Coords) {
    this.mouseX = pos.x;
    this.mouseY = pos.y;
  }

  generateRandomTestBoard() {
    const size = BOARD_ROWS * BOARD_COLS;
    const types = Object.values(JEWEL_TYPE);
    const layout: number[] = [];
    for (let i = 0; i < 9; i++) {
      layout[i] = types[Math.floor(Math.random() * types.length)];
    }

    return layout;
  }

  setTestBoards() {
    const layout = this.generateRandomTestBoard();
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
  }
}

export const GRAVITY_VEC = new Vector({ x: 0, y: 0.1 });
