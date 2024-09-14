import { ImageKey, images } from "./assets/imageAssets/imageAssets";
import { JEWEL_SPELL_TYPE, JEWEL_TYPE } from "./config";
import { BaseEntity, BaseEntityProps, Coords, Size } from "./sharedEntities";
import { Vector } from "./utils";

export type ImageConfig = {
  framesHold?: number;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  frameStartCol?: number;
  frameStartRow?: number;
  frameStopCol?: number;
  frameStopRow?: number;
  scale?: number;
  framesTotal?: number;
  isLooped?: boolean;
  imageName: ImageKey;
  animationTime?: number;
};

export type ImageConfigBase = Pick<
  ImageConfig,
  | "framesMaxWidth"
  | "framesMaxHeight"
  | "scale"
  | "framesHold"
  | "frameStopRow"
  | "frameStartRow"
  | "frameStartCol"
  | "frameStopCol"
>;

export type SpriteProps = Omit<BaseEntityProps, "type"> & {
  image?: HTMLImageElement;
  framesHold?: number;
  framesMaxWidth?: number;
  framesMaxHeight?: number;
  frameStartCol?: number;
  frameStartRow?: number;
  frameStopCol?: number;
  frameStopRow?: number;
  scale?: number;
  framesTotal?: number;
  isLooped?: boolean;
};

export class Sprite extends BaseEntity {
  framesHold: number; // skip frames
  private adjustmentVec: Coords = { x: 0, y: 0 }; // rescale adjustments
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
  private initialResized: Size = { width: 0, height: 0 }; // resized for cell size before rescale
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
    framesHold = 5,
    framesMaxWidth = 1,
    framesMaxHeight = 1,
    frameStartCol = 1,
    frameStartRow = 1,
    framesTotal,
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

  play() {
    if (this.isStatic) return;
    this.reset();
    this.isPlaying = true;
  }

  private animateFrames(_dt: number) {
    this.framesElapsed++;

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
}

export type AnimationProps = SpriteProps & {
  animationTime?: number;
};

export class Animation extends Sprite {
  animationTime;
  private initialAnimationTime;
  targetPosition: Coords;
  private movingVec: Vector = new Vector({ x: 0, y: 0 });
  private movingVelFactor = 10;
  isMoving = false;
  isAnimating = false;
  private noAnimTime = false;
  constructor({ animationTime = 0, ...rest }: AnimationProps) {
    super(rest);
    this.type = "animation";
    this.animationTime = animationTime;
    this.initialAnimationTime = animationTime;
    this.targetPosition = { ...rest.position };
    this.noAnimTime = !animationTime;
  }

  // private isReachedTarget(vel: number) {
  //   const dx = Math.abs(this.position.x - this.targetPosition.x);
  //   const dy = Math.abs(this.position.y - this.targetPosition.y);
  //   const speed = Math.abs(vel);
  //   return dx < speed && dy < speed;
  // }

  reset() {
    super.reset();
    this.isMoving = false;
    this.isAnimating = false;
    this.animationTime = this.initialAnimationTime;
  }

  moveTo(pos: Coords) {
    this.targetPosition = { ...pos };

    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!distance) {
      return;
    }

    const length = distance * 0.5 * this.movingVelFactor;
    this.animationTime = distance / length;
    this.movingVec.setLength(length);
    this.movingVec.setAngle(angle);
    this.isAnimating = true;
    this.isMoving = true;
  }

  play() {
    this.reset();
    super.play();
    this.isAnimating = true;
  }

  private updateMoving(dt: number) {
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;

    // if (this.isReachedTarget(this.movingVec.getLength() * dt)) {
    //   this.reset();
    // }
  }

  private updateAnimating(dt: number) {
    if (this.noAnimTime) {
      if (!this.isPlaying) {
        this.reset();
      }
    } else {
      this.animationTime -= dt;
      if (this.animationTime <= 0) {
        this.reset();
      }
    }
  }

  update(_t: number, dt: number) {
    if (!this.isAnimating) return;
    super.update(_t, dt);
    if (this.isMoving) {
      this.updateMoving(dt);
    }
    this.updateAnimating(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAnimating) return;
    super.draw(ctx);
  }
}

const gemBaseConfig: ImageConfigBase = {
  framesHold: 20,
  framesMaxWidth: 11,
  framesMaxHeight: 1,
  frameStartCol: 1,
  frameStopCol: 1,
  frameStartRow: 1,
  frameStopRow: 1,
};

const imageBaseConfigs: Record<ImageKey, ImageConfigBase> = {
  potionsSheet: {
    framesMaxWidth: 5,
    framesMaxHeight: 2,
    scale: 1,
  },
  assetSheet_1: {},
  plague: {
    framesMaxWidth: 8,
    framesMaxHeight: 4,
  },
  lightning: {
    framesHold: 3,
    framesMaxWidth: 16,
    framesMaxHeight: 1,
  },
  shield: {
    framesHold: 7,
    framesMaxWidth: 5,
    framesMaxHeight: 1,
  },
  light_2: {
    framesHold: 3,
    framesMaxWidth: 8,
    framesMaxHeight: 2,
  },
  expl_big: {
    framesHold: 3,
    framesMaxWidth: 8,
    framesMaxHeight: 4,
  },
  light: {
    framesHold: 3,
    framesMaxWidth: 8,
    framesMaxHeight: 2,
  },
  fire_enchant: {
    framesMaxWidth: 8,
    framesMaxHeight: 4,
  },
  fire_effect_loop: {
    framesMaxHeight: 8,
    framesMaxWidth: 8,
  },
  fireLoop: {
    framesMaxWidth: 6,
    framesMaxHeight: 1,
  },
  gemDarkBlue: gemBaseConfig,
  gemLightGreen: gemBaseConfig,
  gemLiliac: gemBaseConfig,
  gemTurquoise: gemBaseConfig,
  gemGold: gemBaseConfig,
  gemRed: gemBaseConfig,
  gemBlue: gemBaseConfig,
  gemPurple: gemBaseConfig,
  gemDarkBlueSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemLightGreenSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemLiliacSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemTurquoiseSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemGoldSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemRedSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemBlueSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
  gemPurpleSpell: {
    ...gemBaseConfig,
    framesMaxWidth: 16,
  },
};

export const imageConfigs: Record<string, ImageConfig> = {
  [JEWEL_TYPE.RED]: {
    imageName: "gemRed",
  },
  [JEWEL_TYPE.BLUE]: {
    imageName: "gemBlue",
  },
  [JEWEL_TYPE.BROWN]: {
    imageName: "gemDarkBlue",
  },
  [JEWEL_TYPE.GREEN]: {
    imageName: "gemLightGreen",
  },
  [JEWEL_TYPE.ORANGE]: {
    imageName: "gemGold",
  },
  [JEWEL_TYPE.PURPLE]: {
    imageName: "gemPurple",
  },
  [JEWEL_SPELL_TYPE.VAMPIRE]: {
    imageName: "gemBlueSpell",
  },
  [JEWEL_SPELL_TYPE.CRIT_STRIKE]: {
    imageName: "gemRedSpell",
  },
  [JEWEL_SPELL_TYPE.STUN]: {
    imageName: "gemGoldSpell",
  },
  [JEWEL_SPELL_TYPE.SHIELD]: {
    imageName: "gemLightGreenSpell",
  },
  [JEWEL_SPELL_TYPE.POISON]: {
    imageName: "gemPurpleSpell",
  },
  [JEWEL_SPELL_TYPE.EXPLOSION]: {
    imageName: "gemDarkBlueSpell",
  },
  jewelRemove: {
    framesHold: 7,
    imageName: "expl_big",
    scale: 2.5,
    isLooped: false,
  },
  jewelConvert: {
    framesHold: 5,
    imageName: "fire_enchant",
    scale: 3,
    isLooped: false,
  },
};

const htmlImages: Record<string, HTMLImageElement> = {};

export function createAnimation(
  position: Coords,
  size: Size,
  key: string,
  animationTime = 0,
) {
  const config = getImageAndConfig(key);
  const animation = new Animation({
    animationTime: animationTime || config.animationTime,
    position,
    size,
    ...config,
  });
  return animation;
}

export function createSprite(
  position: Coords,
  size: Size,
  key: string | number,
) {
  const config = getImageAndConfig(key);
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
  const baseConfig = imageBaseConfigs[config.imageName];
  return { ...baseConfig, ...config, image: htmlImages[config.imageName] };
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
