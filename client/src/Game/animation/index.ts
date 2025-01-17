import {
  BaseEntity,
  BaseEntityProps,
  Coords,
  Size,
  Timer,
} from "../sharedEntities";
import { getImageAndConfig } from "./config";

export type SpriteProps = Omit<BaseEntityProps, "type"> & {
  image?: HTMLImageElement;
  originSize?: Size;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  frameStartCol?: number;
  frameStartRow?: number;
  frameStopCol?: number;
  frameStopRow?: number;
  scale?: number;
  framesPerSec?: number;
  angle?: number; // in radians
  framesTotal?: number;
  isLooped?: boolean;
};

export class Sprite extends BaseEntity {
  framesPerSec: number;
  /**
   * actual size of the entity. Usually size of the entity is the same as the sprite size
   * but sometimes we use different sizes for sprite and for entity (e.x. for collision detection)
   * so when we rescale our sprite we need to do it relatively to originSize of the entity to place
   * sprite correctly in the center
   */
  originSize: Size;
  prevFrame: number = 0;
  adjustmentVec: Coords = { x: 0, y: 0 }; // rescale adjustments
  framesMaxWidth; // total frame cols
  framesMaxHeight; // total frame rows
  framesCurrentWidth = 0; // current frame col
  framesCurrentHeight = 0; // current fram row
  frameStartCol = 0;
  frameStartRow = 0;
  angle: number;
  frameStopCol;
  frameStopRow;
  framesElapsed = 0;
  frameWidth = 0; // width of a single frame
  frameHeight = 0; // height of a single frame
  scale: number; // current scale
  initialScale: number;
  private image: HTMLImageElement;
  framesTotal;
  framesTotalElapsed = 0;
  isLooped: boolean;
  isStatic: boolean;
  isPlaying = false;
  constructor({
    position,
    size,
    image = { width: 0, height: 0 } as HTMLImageElement,
    framesMaxWidth = 1,
    framesMaxHeight = 1,
    frameStartCol = 1,
    frameStartRow = 1,
    framesPerSec = 60,
    originSize,
    angle = 0,
    framesTotal,
    frameStopCol,
    frameStopRow,
    scale = 1,
    isLooped = true,
  }: SpriteProps) {
    super({ position, size: { ...size }, type: "sprite" });
    this.angle = angle;
    this.framesMaxHeight = framesMaxHeight;
    this.framesMaxWidth = framesMaxWidth;
    this.framesPerSec = framesPerSec;
    this.image = image;
    this.framesTotal =
      framesTotal || this.framesMaxWidth * this.framesMaxHeight;
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
    this.size.width = size.width || this.frameWidth;
    this.size.height = size.height || this.frameHeight;
    this.initialSize = { ...this.size };
    this.isStatic =
      this.frameStopRow === this.frameStartRow &&
      this.frameStopCol === this.frameStartCol;
    this.originSize = originSize || this.initialSize;

    this.rescaleAndAdjust();
  }

  private rescaleAndAdjust() {
    this.size.height = this.initialSize.height * this.scale;
    this.size.width = this.initialSize.width * this.scale;
    const dW = this.size.width - this.originSize.width;
    const dH = this.size.height - this.originSize.height;
    this.adjustmentVec.x = dW * 0.5;
    this.adjustmentVec.y = dH * 0.5;
  }

  rescale(val: number) {
    this.scale = val;
    this.rescaleAndAdjust();
  }

  reset() {
    this.framesCurrentWidth = this.frameStartCol;
    this.framesCurrentHeight = this.frameStartRow;
    this.framesElapsed = 0;
    this.framesTotalElapsed = 0;
    this.prevFrame = 0;
    this.isPlaying = false;
  }

  /**
   * set sprite angle in rads
   */
  setAngle(val: number) {
    this.angle = val;
  }

  play() {
    if (this.isStatic) return;
    this.reset();
    this.isPlaying = true;
  }

  private animateFrames(_dt: number) {
    this.framesElapsed = this.framesElapsed + this.framesPerSec * _dt;

    if (
      this.framesTotalElapsed >= this.framesTotal - 1 ||
      (this.framesCurrentHeight >= this.frameStopRow &&
        this.framesCurrentWidth >= this.frameStopCol)
    ) {
      if (!this.isLooped) {
        this.framesCurrentHeight = -1;
        this.framesCurrentWidth = -1;
        this.isPlaying = false;
        return;
      }
    }

    const framesElapsedInt = this.framesElapsed | 0;
    const frameDiff = Math.trunc(framesElapsedInt - this.prevFrame);

    if (frameDiff >= 1) {
      this.framesTotalElapsed = this.framesTotalElapsed + frameDiff;
      this.prevFrame = framesElapsedInt;
      if (this.framesCurrentWidth < this.frameStopCol) {
        this.framesCurrentWidth += frameDiff;
      } else if (this.framesCurrentHeight < this.frameStopRow) {
        this.framesCurrentWidth = this.frameStartCol;
        this.framesCurrentHeight += frameDiff;
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

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.image || !this.image.complete) return;
    const prevMatrix = ctx.getTransform();
    ctx.translate(
      this.position.x + this.originSize.width * 0.5,
      this.position.y + this.originSize.height * 0.5,
    );

    ctx.rotate(this.angle);
    ctx.translate(
      -this.position.x - this.originSize.width * 0.5,
      -this.position.y - this.originSize.height * 0.5,
    );

    ctx.drawImage(
      this.image,
      this.framesCurrentWidth * this.frameWidth,
      this.framesCurrentHeight * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.position.x - this.adjustmentVec.x,
      this.position.y - this.adjustmentVec.y,
      this.size.width,
      this.size.height,
    );
    ctx.setTransform(prevMatrix);
  }
}

export type AnimationType = "";

export type AnimationProps = {
  animationTime?: number;
  sprite?: Sprite;
  animationType?: AnimationType;
};

export class Animation {
  timer: Timer;
  sprite: Sprite | undefined;
  isAnimating = false;
  animationType: AnimationType;
  private noAnimTime = false;
  constructor({
    animationTime = 0,
    sprite,
    animationType = "",
  }: AnimationProps) {
    this.timer = new Timer({ time: animationTime });
    this.noAnimTime = !animationTime;
    this.animationType = animationType;
    this.sprite = sprite;
  }

  reset() {
    this.sprite?.reset();
    // this.timer.reset();
    this.isAnimating = false;
  }

  play() {
    this.reset();
    this.sprite?.play();
    this.timer.start();
    this.noAnimTime = this.timer.time === 0;
    this.isAnimating = true;
  }

  private updateAnimating(t: number, dt: number) {
    // no time was specified rely on sprite frames
    // otherwise we rely on timer
    if (this.sprite) {
      this.sprite.update(t, dt);
    }

    if (this.noAnimTime && this.sprite) {
      if (!this.sprite.isPlaying) {
        this.reset();
      }
    } else {
      this.timer.update(t, dt);
      if (this.timer.isEnded) {
        this.reset();
      }
    }
  }

  update(t: number, dt: number) {
    if (!this.isAnimating) return;
    this.updateAnimating(t, dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAnimating) return;
    this.sprite?.draw(ctx);
  }
}

let animationStore: Record<string, Animation[]> = {};

function getNonActiveAnimation(key: string) {
  return animationStore[key]?.find((anim) => !anim.isAnimating);
}

function addAnimToStore(key: string, anim: Animation) {
  if (animationStore[key]) {
    animationStore[key].push(anim);
  } else {
    animationStore[key] = [anim];
  }
}

export function cleanAnimStore() {
  animationStore = {};
}

export function createAnimationWithSprite(
  position: Coords,
  spriteKey: string,
  size?: Size,
  animationTime = 0,
  originSize?: Size,
) {
  let animation = getNonActiveAnimation(spriteKey);
  animation?.timer?.setTime(animationTime);
  if (!animation) {
    const config = getImageAndConfig(spriteKey);
    const sprite = createSprite(position, spriteKey, size, originSize);
    animation = new Animation({
      animationTime: animationTime || config.animationTime,
      sprite,
    });
    addAnimToStore(spriteKey, animation);
  }
  animation.sprite!.position = position;

  return animation as Animation;
}

export function createSprite(
  position: Coords,
  key: string | number,
  size?: Size,
  originSize?: Size,
) {
  const config = getImageAndConfig(key);
  const sprite = new Sprite({
    ...config,
    position,
    size: size || config.size || { width: 0, height: 0 },
    originSize,
  });
  return sprite;
}
