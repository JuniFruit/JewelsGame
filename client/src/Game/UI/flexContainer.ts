import {
  Coords,
  InteractableEntity,
  InteractableEntityProps,
  Size,
} from "../sharedEntities";
import { getCenter, getCenteredPos } from "../utils";

export type FlexContainerProps = Omit<InteractableEntityProps, "type"> & {
  justifyItems?: JustifyKey;
  direction?: FlexDirection;
  alignItems?: AlignKey;
  gap?: number;
  isOriginCentered?: boolean;
};

export type JustifyKey = "center" | "start" | "end";
export type AlignKey = "start" | "center" | "end";
export type FlexDirection = "column" | "row";

export class FlexContainer extends InteractableEntity {
  private _justifyItems: JustifyKey;
  private _alignItems: AlignKey;
  private _directon: FlexDirection;
  private containerCenter: Coords;
  private totalSpaceTaken: Size;
  private currentHovered: InteractableEntity | undefined;
  private gap: number;
  constructor({
    alignItems = "center",
    justifyItems = "center",
    direction = "row",
    isOriginCentered = true,
    gap = 0,
    ...rest
  }: FlexContainerProps) {
    super({ ...rest, type: "flex_container" });
    this._justifyItems = justifyItems;
    this._alignItems = alignItems;
    this._directon = direction;
    this.gap = gap;
    if (isOriginCentered) {
      this.position = getCenteredPos(this.position, this.size);
    }
    this.containerCenter = getCenter(this.position, this.size);
    this.totalSpaceTaken = this.getTotalSpaceTaken();
    this.recalculateChildren();
  }

  private recalculateChildren() {
    this.resizeElements();
    this.totalSpaceTaken = this.getTotalSpaceTaken();
    for (let i = 0; i < this.children.length; i++) {
      const el = this.children[i];
      if (this._directon === "row") {
        switch (this._alignItems) {
          case "start":
            el.posY = this.position.y;
            break;

          case "center":
            el.posY = this.containerCenter.y - el.size.height * 0.5;
            break;
          case "end":
            el.posY = this.position.y - el.size.height;
            break;
        }
        switch (this._justifyItems) {
          case "center":
            el.posX =
              this.containerCenter.x -
              this.totalSpaceTaken.width * 0.5 +
              i * el.size.width +
              i * this.gap;
            break;

          case "start":
            el.posX = this.position.x + i * el.size.width + i * this.gap;
            break;

          case "end":
            el.posX =
              this.position.x +
              this.size.width -
              el.size.width * (this.children.length - i);
            el.posX = el.posX + i * this.gap;
            break;
        }
      }
      if (this._directon === "column") {
        switch (this._alignItems) {
          case "start":
            el.posX = this.position.x;
            break;

          case "center":
            el.posX = this.containerCenter.x - el.size.width * 0.5;
            break;
          case "end":
            el.posX = this.position.x + this.size.width - el.size.width;
            break;
        }
        switch (this._justifyItems) {
          case "center":
            el.posY =
              this.containerCenter.y -
              this.totalSpaceTaken.height * 0.5 +
              i * el.size.height +
              i * this.gap;
            break;
          case "start":
            el.posY = this.position.y + i * el.size.height + i * this.gap;
            break;
          case "end":
            el.posY =
              this.position.y +
              this.size.height -
              el.size.height * (this.children.length - i);
            el.posY = el.posY + i * this.gap;

            break;
        }
      }
      el.initialPos = { ...el.position };
    }
  }

  private resizeElements() {
    let maxWidth: number = 0;
    let maxHeight: number = 0;
    for (let el of this.children) {
      maxWidth = Math.max(maxWidth, el.size.width);
      maxHeight = Math.max(maxHeight, el.size.height);
    }
    const elTargetSize: Size = {
      width: 0,
      height: 0,
    };
    if (this.direction === "row") {
      elTargetSize.height = maxHeight;
      elTargetSize.width =
        (this.totalSpaceTaken.width - (this.children.length - 1) * this.gap) /
        this.children.length;
    }
    if (this.direction === "column") {
      elTargetSize.height =
        (this.totalSpaceTaken.height - (this.children.length - 1) * this.gap) /
        this.children.length;
      elTargetSize.width = maxWidth;
    }
    for (let el of this.children) {
      el.size = { ...elTargetSize };
      el.initialSize = { ...elTargetSize };
      el.isFrozen = true;
    }
  }

  private getTotalSpaceTaken() {
    const total: Size = { width: 0, height: 0 };

    for (let el of this.children) {
      total.width += el.size.width;
      total.height += el.size.height;
    }
    total.width += (this.children.length - 1) * this.gap;
    total.height += (this.children.length - 1) * this.gap;

    return total;
  }

  get direction() {
    return this._directon;
  }

  set direction(val: FlexDirection) {
    this._directon = val;
    this.recalculateChildren();
  }

  get justifyItems() {
    return this._justifyItems;
  }

  set justifyItems(val: JustifyKey) {
    this._justifyItems = val;
    this.recalculateChildren();
  }

  get alignItems() {
    return this._alignItems;
  }

  set alignItems(val: AlignKey) {
    this._alignItems = val;
    this.recalculateChildren();
  }

  mouseDown(mousePos: Coords): void {
    this.currentHovered?.mouseDown(mousePos);
  }

  mouseUp(mousePos: Coords): void {
    this.currentHovered?.mouseUp(mousePos);
  }

  checkIsHovered(mousePos: Coords): boolean {
    if (this.currentHovered && this.currentHovered.checkIsHovered(mousePos)) {
      return true;
    }
    this.currentHovered = undefined;
    for (let el of this.children) {
      if (el.checkIsHovered(mousePos)) {
        this.currentHovered = el;
        return true;
      }
    }
    return false;
  }

  update(t: number, dt: number): void {
    for (let child of this.children) {
      child.update(t, dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let child of this.children) {
      child.draw(ctx);
    }
  }
}
