import { type ImageKey, images } from "../assets/imageAssets/imageAssets";
import { JEWEL_SPELL_TYPE, JEWEL_TYPE } from "../config";
import { LiturgyEffect } from "../effects";
import type { Size } from "../sharedEntities";

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

const gemSuperSpellBaseConfig: ImageConfigBase = {
  framesPerSec: 10,
  framesMaxWidth: 10,
};

const imageBaseConfigs: Record<ImageKey, ImageConfigBase> = {
  gemLightGreenSuperSpell: gemSuperSpellBaseConfig,
  gemTurquoiseSuperSpell: gemSuperSpellBaseConfig,
  gemGoldSuperSpell: gemSuperSpellBaseConfig,
  gemDarkBlueSuperSpell: gemSuperSpellBaseConfig,
  gemPurpleSuperSpell: gemSuperSpellBaseConfig,
  gemBlueSuperSpell: gemSuperSpellBaseConfig,
  gemRedSuperSpell: gemSuperSpellBaseConfig,
  gemLiliacSuperSpell: gemSuperSpellBaseConfig,
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
  [JEWEL_TYPE.FATIGUE]: {
    imageName: "gemBlueSuperSpell",
  },
  [JEWEL_SPELL_TYPE.DRILL_STRIKE]: {
    imageName: "gemRedSuperSpell",
  },
  [JEWEL_SPELL_TYPE.BASHING_STRIKE]: {
    imageName: "gemGoldSuperSpell",
  },
  [JEWEL_SPELL_TYPE.LITURGY]: {
    imageName: "gemLightGreenSuperSpell",
  },
  [JEWEL_SPELL_TYPE.CONTAMINATION]: {
    imageName: "gemPurpleSuperSpell",
  },
  [JEWEL_SPELL_TYPE.MINEFIELD]: {
    imageName: "gemDarkBlueSuperSpell",
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
  stunEffect: {
    imageName: "fireLoop",
    scale: 2.5,
  },
  jewelConvert: {
    framesPerSec: 15,
    imageName: "plague",
    scale: 3,
    isLooped: false,
  },
  poisonEffect: {
    framesPerSec: 15,
    imageName: "plague",
    scale: 3,
  },
  shieldEffect: {
    imageName: "shield",
    scale: 2.5,
  },
  critStrikeEffect: {
    imageName: "lightning",
    scale: 2.5,
  },
  liturgyEffect: {
    framesPerSec: 15,
    imageName: "light_2",
    scale: 2.5,
  },
};

const htmlImages: Record<string, HTMLImageElement> = {};

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
