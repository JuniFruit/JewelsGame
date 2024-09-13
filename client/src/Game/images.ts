import { ImageKey, images } from "./assets/imageAssets/imageAssets";
import { JEWEL_TYPE } from "./config";
import { BaseEntity, BaseEntityProps, Coords, Size } from "./sharedEntities";

export type ImageConfig = {
  framesHold?: number;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  frameStartCol?: number;
  frameStartRow?: number;
  frameStopCol?: number;
  frameStopRow?: number;
  scale?: number;
  isLooped?: boolean;
  imageName: ImageKey;
};

export type SpriteProps = Omit<BaseEntityProps, "type"> & {
  image: HTMLImageElement;
  framesHold?: number;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  frameStartCol?: number;
  frameStartRow?: number;
  frameStopCol?: number;
  frameStopRow?: number;
  scale?: number;
  isLooped?: boolean;
};

export class Sprite extends BaseEntity {
  framesHold: number; // skip frames
  adjustmentVec: Coords = { x: 0, y: 0 }; // rescale adjustments
  framesMaxWidth; // total frame cols
  framesMaxHeight; // total frame rows
  framesCurrentWidth = 0; // current frame col
  framesCurrentHeight = 0; // current fram row
  frameStartCol = 0;
  frameStartRow = 0;
  frameStopCol;
  frameStopRow;
  framesElapsed = 0;
  frameWidth = 0; // width of a single frame
  frameHeight = 0; // height of a single frame
  resized: Size = { width: 0, height: 0 }; // resized for cell size
  initialResized: Size = { width: 0, height: 0 }; // resized for cell size before rescale
  scale: number; // current scale
  initialScale: number;
  image: HTMLImageElement;
  framesTotal;
  framesTotalElapsed = 0;
  isLooped: boolean;
  isStatic: boolean;
  isPlaying = false;
  constructor({
    position,
    size,
    image,
    framesHold = 5,
    framesMaxWidth = 1,
    framesMaxHeight = 1,
    frameStartCol = 1,
    frameStartRow = 1,
    frameStopCol,
    frameStopRow,
    scale = 1,
    isLooped = true,
  }: SpriteProps) {
    super({ position, size, type: "sprite" });
    this.framesHold = framesHold;
    this.framesMaxHeight = framesMaxHeight;
    this.framesMaxWidth = framesMaxWidth;
    this.image = image;
    this.framesTotal = this.framesMaxWidth * this.framesMaxHeight;
    this.isLooped = isLooped;
    this.frameWidth = image.width / this.framesMaxWidth;
    this.frameHeight = image.height / this.framesMaxHeight;
    this.frameStartRow = frameStartRow - 1;
    this.frameStartCol = frameStartCol - 1;
    this.framesCurrentWidth = frameStartCol - 1;
    this.framesCurrentHeight = frameStartRow - 1;
    this.frameStopCol = frameStopCol ? frameStopCol - 1 : framesMaxWidth - 1;
    this.frameStopRow = frameStopRow ? frameStopRow - 1 : framesMaxHeight - 1;
    this.initialScale = scale;
    this.scale = scale;
    this.resized.height = (size.height / this.frameHeight) * this.frameHeight;
    this.resized.width = (size.width / this.frameWidth) * this.frameWidth;
    this.initialResized.height = this.resized.height;
    this.initialResized.width = this.resized.width;
    this.isStatic =
      this.frameStopRow === this.frameStartRow &&
      this.frameStopCol === this.frameStartCol;
    this.rescaleAndAdjust();
  }

  private rescaleAndAdjust() {
    this.resized.height =
      (this.size.height / this.frameHeight) * this.frameHeight * this.scale;
    this.resized.width =
      (this.size.width / this.frameWidth) * this.frameWidth * this.scale;
    const dW = this.resized.width - this.initialResized.width;
    const dH = this.resized.height - this.initialResized.height;
    this.adjustmentVec.x = dW * 0.5;
    this.adjustmentVec.y = dH * 0.5;
  }

  rescale(val: number) {
    this.scale = val;
    this.rescaleAndAdjust();
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
      this.image,
      this.framesCurrentWidth * this.frameWidth,
      this.framesCurrentHeight * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.position.x - this.adjustmentVec.x,
      this.position.y - this.adjustmentVec.y,
      this.resized.width,
      this.resized.height,
    );
  }

  play() {
    if (this.isStatic) return;
    this.reset();
    this.isPlaying = true;
  }

  private animateFrames(_dt: number) {
    this.framesElapsed++;

    const isOver =
      !this.isLooped && this.framesTotalElapsed >= this.framesTotal - 1;

    if (
      isOver ||
      (this.framesCurrentHeight > this.frameStopRow &&
        this.framesMaxWidth > this.frameStopCol)
    ) {
      this.framesCurrentHeight = -1;
      this.framesCurrentWidth = -1;
      this.isPlaying = false;
      return;
    }

    if (this.framesElapsed % this.framesHold === 0) {
      this.framesTotalElapsed = this.framesTotalElapsed + 1;
      if (this.framesCurrentWidth < this.frameStopCol) {
        this.framesCurrentWidth++;
      } else if (this.framesCurrentHeight < this.frameStopRow) {
        this.framesCurrentWidth = this.frameStartCol;
        this.framesCurrentHeight++;
      } else {
        this.framesCurrentHeight = this.frameStartRow;
        this.framesCurrentWidth = this.frameStartCol;
      }
    }
  }

  update(_t: number, dt: number) {
    if (this.isPlaying) {
      this.animateFrames(dt);
    }
  }
}

export const imageConfigs: Record<string, ImageConfig> = {
  [JEWEL_TYPE.RED]: {
    imageName: "potionsSheet",
    framesHold: 10,
    framesMaxWidth: 5,
    scale: 1,
    frameStartCol: 1,
    frameStartRow: 2,
    frameStopCol: 1,
    frameStopRow: 2,
    framesMaxHeight: 2,
    isLooped: true,
  },
  // [JEWEL_TYPE.BLUE]: { imageName: "potionsSheet" },
  // [JEWEL_TYPE.BROWN]: { imageName: "potionsSheet" },
};

const htmlImages: Record<string, HTMLImageElement> = {};

export function createSprite(
  position: Coords,
  size: Size,
  key: string | number,
) {
  const config = getImageAndConfig(key);
  if (!config.image) return;
  const sprite = new Sprite({
    position,
    size,
    ...config,
  });
  return sprite;
}

export function getImageAndConfig(
  key: string | number,
): ImageConfig & { image: HTMLImageElement } {
  const config = imageConfigs[key] || {};
  return { ...config, image: htmlImages[config.imageName] };
}

export async function initAllImages() {
  const promises = Object.keys(images).map(async (imgKey) => {
    await new Promise((res) => {
      const img = new Image();

      img.src = (images as any)[imgKey];
      img.onload = function () {
        htmlImages[imgKey] = img;
        res(true);
      };
    });
  });
  await Promise.allSettled(promises);
}
