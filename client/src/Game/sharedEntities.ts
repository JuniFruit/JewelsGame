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

  resetMouseStates() {
    this.isClicking = false;
    this.isHovered = false;
  }

  mouseDown() {
    this.isClicking = true;
  }
  mouseUp() {
    this.isClicking = false;
  }
  mouseOut() {}
}
