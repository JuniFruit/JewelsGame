import { ImageKey, images } from "./assets/imageAssets/imageAssets";
import { JEWEL_SPELL_TYPE, JEWEL_TYPE } from "./config";
import {
  BaseEntity,
  BaseEntityProps,
  Coords,
  Size,
  Timer,
} from "./sharedEntities";
import { Vector } from "./utils";

export type ImageConfig = {
  framesPerSec?: number;
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
  size?: Size;
};

export type ImageConfigBase = Omit<ImageConfig, "imageName">;

export type SpriteProps = Omit<BaseEntityProps, "type"> & {
  image?: HTMLImageElement;
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
  prevFrame: number = 0;
  private adjustmentVec: Coords = { x: 0, y: 0 }; // rescale adjustments
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
    framesMaxWidth = 1,
    framesMaxHeight = 1,
    frameStartCol = 1,
    frameStartRow = 1,
    framesPerSec = 60,
    angle = 0,
    framesTotal,
    frameStopCol,
    frameStopRow,
    scale = 1,
    isLooped = true,
  }: SpriteProps) {
    super({ position, size, type: "sprite" });
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
    this.framesCurrentWidth = this.frameStartCol;
    this.framesCurrentHeight = this.frameStartRow;
    this.framesElapsed = 0;
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
    ctx.translate(this.position.x, this.position.y);

    ctx.rotate(this.angle);
    ctx.translate(-this.position.x, -this.position.y);

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
    ctx.setTransform(prevMatrix);
  }
}

export type AnimationType = "";

export type AnimationProps = Omit<BaseEntityProps, "type"> & {
  animationTime?: number;
  sprite?: Sprite;
  animationType?: AnimationType;
};

export class Animation extends BaseEntity {
  timer: Timer;
  sprite: Sprite | undefined;
  private movingVec: Vector = new Vector({ x: 0, y: 0 });
  private movingVelFactor = 800;
  isMoving = false;
  isAnimating = false;

  private noAnimTime = false;
  constructor({ animationTime = 0, sprite, ...rest }: AnimationProps) {
    super({ type: "animation", ...rest });
    this.timer = new Timer({ time: animationTime });
    this.noAnimTime = !animationTime;
    this.sprite = sprite;
  }

  reset() {
    this.sprite?.reset();
    // this.timer.reset();
    this.isMoving = false;
    this.isAnimating = false;
  }

  private setAngle(dx: number, dy: number) {
    const angle = Math.atan2(dy, dx);
    this.sprite?.setAngle(angle);
    this.movingVec.setAngle(angle);
  }

  moveTo(pos: Coords, velFactor?: number) {
    this.targetPosition = { ...pos };

    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!distance) {
      return;
    }

    const length = velFactor || this.movingVelFactor;
    this.timer.setTime(distance / length);
    this.movingVec.setLength(length);
    this.setAngle(dx, dy);
    this.play();
    this.isMoving = true;
    this.noAnimTime = false;
  }

  play() {
    this.reset();
    this.sprite?.play();
    this.timer.start();
    this.isAnimating = true;
  }

  private updateMoving(dt: number) {
    this.position.x += this.movingVec.x * dt;
    this.position.y += this.movingVec.y * dt;

    // if (this.isReachedTarget(this.movingVec.getLength() * dt)) {
    //   this.reset();
    // }
  }

  private updateAnimating(t: number, dt: number) {
    // no time was specified rely on sprite frames
    // otherwise we rely on timer
    this.sprite?.update(t, dt);

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
    if (this.isMoving) {
      this.updateMoving(dt);
    }
    this.updateAnimating(t, dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAnimating) return;
    this.sprite?.draw(ctx);
  }
}

const gemBaseConfig: ImageConfigBase = {
  framesMaxWidth: 11,
  framesMaxHeight: 1,
  frameStartCol: 1,
  frameStopCol: 1,
  frameStartRow: 1,
  frameStopRow: 1,
};

const gemSpellBaseConfig: ImageConfigBase = {
  framesPerSec: 10,
  framesMaxWidth: 16,
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
    framesPerSec: 10,
    framesMaxWidth: 16,
    framesMaxHeight: 1,
  },
  shield: {
    framesPerSec: 7,
    framesMaxWidth: 5,
    framesMaxHeight: 1,
  },
  light_2: {
    framesPerSec: 10,
    framesMaxWidth: 8,
    framesMaxHeight: 2,
  },
  expl_big: {
    framesPerSec: 10,
    framesMaxWidth: 8,
    framesMaxHeight: 4,
  },
  light: {
    framesPerSec: 10,
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
  gemDarkBlueSpell: gemSpellBaseConfig,
  gemLightGreenSpell: gemSpellBaseConfig,
  gemLiliacSpell: gemSpellBaseConfig,
  gemTurquoiseSpell: gemSpellBaseConfig,
  gemGoldSpell: gemSpellBaseConfig,
  gemRedSpell: gemSpellBaseConfig,
  gemBlueSpell: gemSpellBaseConfig,
  gemPurpleSpell: gemSpellBaseConfig,
  blueEffectSheet: {
    framesMaxWidth: 20,
    framesMaxHeight: 16,
  },
  greenEffectSheet: {
    framesMaxWidth: 20,
    framesMaxHeight: 16,
  },
  redEffectSheet: {
    framesMaxWidth: 20,
    framesMaxHeight: 16,
  },
  yellowEffectSheet: {
    framesMaxWidth: 20,
    framesMaxHeight: 16,
  },
  purpleEffectSheet: {
    framesMaxWidth: 20,
    framesMaxHeight: 16,
  },
};

// Temp base configs. TODO: rethink config idea
const jewelAttackBaseConfig: ImageConfigBase = {
  framesPerSec: 10,
  frameStartCol: 12,
  frameStopCol: 15,
  frameStartRow: 16,
  frameStopRow: 16,
  size: { width: 50, height: 50 },
  scale: 1,
};

const jewelRemoveBaseConfig: ImageConfigBase = {
  // framesHold: 10,
  // frameStartCol: 17,
  // frameStopCol: 20,
  // frameStartRow: 12,
  // frameStopRow: 12,
  // isLooped: false,
  // scale: 2.5,
  framesPerSec: 20,
  isLooped: false,
  scale: 2.5,
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
  [`jewelRemove_${JEWEL_TYPE.RED}`]: {
    ...jewelRemoveBaseConfig,
    imageName: "expl_big",
  },
  [`jewelRemove_${JEWEL_TYPE.BROWN}`]: {
    framesPerSec: 20,
    isLooped: false,
    imageName: "expl_big",
    scale: 2.5,
  },
  [`jewelRemove_${JEWEL_TYPE.BLUE}`]: {
    ...jewelRemoveBaseConfig,
    imageName: "expl_big",
  },
  [`jewelRemove_${JEWEL_TYPE.GREEN}`]: {
    ...jewelRemoveBaseConfig,
    imageName: "expl_big",
  },
  [`jewelRemove_${JEWEL_TYPE.PURPLE}`]: {
    ...jewelRemoveBaseConfig,
    imageName: "expl_big",
  },
  [`jewelRemove_${JEWEL_TYPE.ORANGE}`]: {
    ...jewelRemoveBaseConfig,
    imageName: "expl_big",
  },

  [`jewelAttack_${JEWEL_TYPE.RED}`]: {
    ...jewelAttackBaseConfig,
    imageName: "redEffectSheet",
  },
  [`jewelAttack_${JEWEL_TYPE.BROWN}`]: {
    ...jewelAttackBaseConfig,
    imageName: "purpleEffectSheet",
  },
  [`jewelAttack_${JEWEL_TYPE.BLUE}`]: {
    ...jewelAttackBaseConfig,
    imageName: "blueEffectSheet",
  },
  [`jewelAttack_${JEWEL_TYPE.GREEN}`]: {
    ...jewelAttackBaseConfig,
    imageName: "greenEffectSheet",
  },
  [`jewelAttack_${JEWEL_TYPE.PURPLE}`]: {
    ...jewelAttackBaseConfig,
    imageName: "purpleEffectSheet",
  },
  [`jewelAttack_${JEWEL_TYPE.ORANGE}`]: {
    ...jewelAttackBaseConfig,
    imageName: "yellowEffectSheet",
  },
  jewelHover: {
    framesPerSec: 10,
    imageName: "light",
    scale: 2.5,
  },

  jewelConvert: {
    framesPerSec: 15,
    imageName: "plague",
    scale: 3,
    isLooped: false,
  },
};

const htmlImages: Record<string, HTMLImageElement> = {};

export function createAnimationWithSprite(
  position: Coords,
  spriteKey: string,
  size?: Size,
  animationTime = 0,
) {
  const config = getImageAndConfig(spriteKey);
  const sprite = createSprite(position, spriteKey, size);
  const animation = new Animation({
    animationTime: animationTime || config.animationTime,
    sprite,
    position,
    size: config.size || size || { width: 0, height: 0 },
  });
  return animation;
}

export function createSprite(
  position: Coords,
  key: string | number,
  size?: Size,
) {
  const config = getImageAndConfig(key);
  const sprite = new Sprite({
    position,
    size: config.size || size || { width: 0, height: 0 },
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
