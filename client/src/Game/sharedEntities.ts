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
  protected _position: Coords;
  protected _size: Size;
  initialPos: Coords;
  initialSize: Size;
  targetPosition: Coords;

  constructor({ type, position, size }: BaseEntityProps) {
    this.type = type;
    this._size = size;
    this._position = position;
    this.initialPos = { ...position };
    this.initialSize = { ...size };
    this.targetPosition = { ...position };
  }

  set posX(val: number) {
    this._position.x = val;
  }

  set posY(val: number) {
    this._position.y = val;
  }

  get posX() {
    return this._position.x;
  }

  get posY() {
    return this._position.y;
  }

  set position(val: Coords) {
    this._position = val;
  }

  get position() {
    return this._position;
  }

  set size(val: Size) {
    this._size = val;
  }
  get size() {
    return this._size;
  }

  update(_t: number, _dt: number) {}
  draw(_ctx: CanvasRenderingContext2D) {}
}

export type InteractableEntityProps = BaseEntityProps & {
  children?: InteractableEntity[];
  id?: string;
  hidden?: boolean;
};

export class InteractableEntity extends BaseEntity {
  isHovered = false;
  isClicking = false;
  isFrozen = false; // don't allow size/pos recalculation
  clickedPosition: Coords = { x: 0, y: 0 };
  children: InteractableEntity[] = [];
  hidden = false;
  static instances = 0;
  id: string;

  constructor({
    type,
    position,
    size,
    id = "",
    hidden = false,
    children = [],
  }: InteractableEntityProps) {
    super({ type, position, size });
    this.children = children;
    this.hidden = hidden;
    InteractableEntity.instances += 1;
    this.id = id || type + InteractableEntity.instances;
  }

  checkIsHovered(mousePos: Coords) {
    if (this.hidden) return false;
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
    if (this.hidden) return;
    this.isClicking = true;
    this.clickedPosition = {
      x: Math.max(_mousePos.x - this.position.x, 0),
      y: Math.max(_mousePos.y - this.position.y, 0),
    };
  }
  mouseUp(_mousePos: Coords) {
    if (this.hidden) return;
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
