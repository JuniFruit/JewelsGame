import { MOUSE_SIZE } from "./config";
import { detectCollision } from "./utils";

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
  targetPosition: Coords;

  constructor({ type, position, size }: BaseEntityProps) {
    this.type = type;
    this.size = size;
    this.position = position;
    this.initialPos = { ...position };
    this.initialSize = { ...size };
    this.targetPosition = { ...position };
  }

  update(_t: number, _dt: number) {}

  draw(_ctx: CanvasRenderingContext2D) {}
}

export class InteractableEntity extends BaseEntity {
  isHovered = false;
  isClicking = false;
  clickedPosition: Coords = { x: 0, y: 0 };

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

  resetMouseStates() {
    this.isClicking = false;
    this.isHovered = false;
  }

  mouseDown(_mousePos: Coords) {
    this.isClicking = true;
    this.clickedPosition = {
      x: Math.max(_mousePos.x - this.position.x, 0),
      y: Math.max(_mousePos.y - this.position.y, 0),
    };
  }
  mouseUp(_mousePos: Coords) {
    this.isClicking = false;
    this.clickedPosition = { x: 0, y: 0 };
  }
  mouseOut(_mousePos: Coords) {}
}

export type TimerProps = {
  time: number;
  pulseBound?: number;
};

export class Timer {
  time: number;
  timeLeft: number;
  isGoing = false;
  isEnded = false;
  onPulse?: () => void;
  private pulseBound = 0;
  private pulseTime = 0;
  constructor({ time, pulseBound = 0 }: TimerProps) {
    this.time = time;
    this.timeLeft = time;
    this.pulseBound = pulseBound;
  }

  reset() {
    this.isGoing = false;
    this.isEnded = false;
    this.timeLeft = this.time;
    this.pulseTime = 0;
  }

  start() {
    this.reset();
    this.isGoing = true;
  }

  stop() {
    this.isEnded = true;
    this.isGoing = false;
  }
  /**
   * Pulse every N seconds, provide N
   */
  setPulseBound(val: number) {
    this.pulseBound = val;
  }

  setTime(val: number) {
    this.time = val;
  }

  update(_t: number, dt: number) {
    if (!this.isGoing) return;
    if (this.pulseBound) {
      this.pulseTime += dt;
      if (this.pulseTime >= this.pulseBound) {
        this.onPulse?.();
        this.pulseTime = 0;
      }
    }
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.stop();
    }
  }
}
