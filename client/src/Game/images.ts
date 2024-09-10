import { BaseEntity, BaseEntityProps } from "./sharedEntities";

export type SpriteProps = Omit<BaseEntityProps, "type"> & {
  image: HTMLImageElement;
  framesHold?: number;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  isLooped?: boolean;
};

export class Sprite extends BaseEntity {
  framesHold: number; // skip frames
  framesMaxWidth;
  framesMaxHeight;
  framesCurrentWidth = 0;
  framesCurrentHeight = 0;
  framesElapsed = 0;
  image;
  framesTotal;
  framesTotalElapsed = 0;
  isLooped: boolean;
  isPlaying = false;
  constructor({
    position,
    size,
    image,
    framesHold = 5,
    framesMaxWidth = 6,
    framesMaxHeight = 1,
    isLooped = true,
  }: SpriteProps) {
    super({ position, size, type: "sprite" });
    this.framesHold = framesHold;
    this.framesMaxHeight = framesMaxHeight;
    this.framesMaxWidth = framesMaxWidth;
    this.image = image;
    this.framesTotal = this.framesMaxWidth * this.framesMaxHeight;
    this.isLooped = isLooped;
  }

  reset() {
    this.framesCurrentWidth = 0;
    this.framesCurrentHeight = 0;
    this.framesElapsed = 0;
    this.isPlaying = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.image || !this.image.complete) return;
    ctx.drawImage(
      this.image!,
      this.framesCurrentWidth * (this.image!.width / this.framesMaxWidth),
      this.framesCurrentHeight * (this.image!.height / this.framesMaxHeight),
      this.image!.width / this.framesMaxWidth,
      this.image!.height / this.framesMaxHeight,
      this.position.x,
      this.position.y,
      300,
      400,
      // imgWidth,
      // imgHeight,
    );
  }

  play() {
    this.reset();
    this.isPlaying = true;
  }

  private animateFrames() {
    this.framesElapsed++;

    if (!this.isLooped && this.framesTotalElapsed >= this.framesTotal - 1) {
      this.framesCurrentHeight = -1;
      this.framesCurrentWidth = -1;
      this.isPlaying = false;
      return;
    }

    if (this.framesElapsed % this.framesHold === 0) {
      this.framesTotalElapsed++;
      if (this.framesCurrentWidth < this.framesMaxWidth - 1) {
        this.framesCurrentWidth++;
      } else if (this.framesCurrentHeight < this.framesMaxHeight - 1) {
        this.framesCurrentWidth = 0;
        this.framesCurrentHeight++;
      } else {
        this.framesCurrentHeight = 0;
        this.framesCurrentWidth = 0;
      }
    }
  }

  update() {
    if (this.isPlaying) {
      this.animateFrames();
    }
  }
}

const spriteImages: Record<string, HTMLImageElement> = {};

const staticImages: Record<string, HTMLImageElement> = {};

export function getImage(key: string) {
  return spriteImages[key] || staticImages[key];
}

export async function initAllImages() {}
