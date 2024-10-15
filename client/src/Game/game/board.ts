import { Matches } from ".";
import { Animation, createAnimationWithSprite } from "../animation";
import { JEWEL_SPELL_CONVERSION, JEWEL_SPELL_TYPE } from "../config";
import {
  FatigueEffect,
  LiturgyEffect,
  PoisonEffect,
  ShieldEffect,
  StunEffect,
} from "../effects";
import { Effect } from "../effects/base";
import { BaseEntity, BaseEntityProps, Coords, Size } from "../sharedEntities";
import { AttackProjectile } from "../spells/attackProjectile";
import { Spell } from "../spells/base";
import { BashStrikeSpell } from "../spells/bashStrike";
import { ContaminationSpell } from "../spells/contamination";
import { CritStrike } from "../spells/critStrike";
import { DrillStrikeSpell } from "../spells/drillStrike";
import { ExplosionSpell } from "../spells/explosion";
import { FatigueSpell } from "../spells/fatigue";
import { MinefieldSpell } from "../spells/minefield";
import { PoisonSpell } from "../spells/poison";
import { ShieldSpell } from "../spells/shield";
import { StunSpell } from "../spells/stun";
import { VampiricSpell } from "../spells/vampiric";
import { BoardUI } from "../UI/boardUI";
import { convertTo2dInd, getCenter } from "../utils";
import { Jewel } from "./jewel";

export type BoardProps = Omit<BaseEntityProps, "type"> & {
  cols: number;
  rows: number;
  health: number;
  player: "p1" | "p2";
};

export class Board extends BaseEntity {
  cols = 0;
  rows = 0;
  jewels: Jewel[] = [];
  t = 0;
  jewelSize: Size;
  totalHealth: number = 0;
  health: number = 0;
  healthPer: number = 0;
  chargeLevel: number = 0;
  player: "p1" | "p2" = "p1";
  opponentBoard: Board | undefined;
  effects: Record<string, Effect> = {};
  spellsToCast: Spell[] = []; // queue for spells to cast
  UI: BoardUI | undefined;
  private indicesToFall: number[] = [];
  private currentSwapping: Jewel | undefined;
  effectKeys: string[] = []; // normalization for effects
  // states
  isFalling = false;
  isNewBoard = true;
  isCastingSpell = false;
  isReadyToRefill = false;
  isShaking = false;

  constructor({
    position,
    size,
    cols,
    rows,
    player,
    health = 100,
  }: BoardProps) {
    super({ position, size, type: "board" });
    this.cols = cols;
    this.rows = rows;
    this.health = health;
    this.totalHealth = health;
    this.player = player;
    this.jewelSize = {
      width: this.size.width / this.cols,
      height: this.size.height / this.rows,
    };
    this.recalculateHealthPercent();
  }

  setOpponentBoard(board: Board) {
    this.opponentBoard = board;
  }

  private recalculateHealthPercent() {
    this.healthPer = (this.health / this.totalHealth) * 100;
  }

  applyDamage(val: number) {
    let dmg = val;
    if (this.effects.fatigue?.isActive) {
      dmg *= 1.5;
    }
    if (this.effects.shield?.isActive) {
      dmg = val * 0.7;
    }
    this.health -= dmg;
    if (this.health <= 0) {
      this.health = 0;
    }
    this.recalculateHealthPercent();
    this.UI?.healthBar?.applyDamage(val);
  }

  useCharge(type: "explosion" | "heal") {
    if (this.effects?.stun?.isActive) return;
    switch (type) {
      case "explosion":
        const arr = Array(this.jewels.length)
          .fill(null)
          .map((_, ind) => ind);
        this.removeLine(arr);
        break;
      case "heal":
        this.applyHeal(300);
        break;
    }
    this.chargeLevel = 0;
  }

  applyHeal(val: number) {
    let heal = val;
    if (this.effects.fatigue?.isActive) {
      heal *= 0.5;
    }

    this.health += heal;
    if (this.health >= this.totalHealth) {
      this.health = this.totalHealth;
    }
    this.recalculateHealthPercent();
    this.UI?.healthBar?.applyHeal(val);
  }

  applyEffect(type: number) {
    let effect: Effect | undefined;
    let anim: Animation | undefined;
    switch (type) {
      case JEWEL_SPELL_TYPE.STUN:
        effect = this.effects.stun;
        if (effect) {
          effect.timer.setTime(5);
        } else {
          effect = new StunEffect({
            activeTime: 5,
            effectType: "stun",
            board: this,
            animKey: "stunEffect",
          });
        }
        break;
      case JEWEL_SPELL_TYPE.POISON:
        effect =
          this.effects.poison ||
          new PoisonEffect({
            activeTime: 5,
            effectType: "poison",
            board: this,
            animKey: "poisonEffect",
          });
        break;
      case JEWEL_SPELL_TYPE.SHIELD:
        effect =
          this.effects.shield ||
          new ShieldEffect({
            activeTime: Infinity,
            effectType: "shield",
            board: this,
          });
        anim = createAnimationWithSprite(
          this.getBoardCenter(),
          "shieldEffect",
          { width: 50, height: 50 },
          2,
        );
        break;
      case JEWEL_SPELL_TYPE.FATIGUE:
        effect =
          this.effects.fatigue ||
          new FatigueEffect({
            activeTime: 10,
            effectType: "fatigue",
            board: this,
            animKey: "poisonEffect",
          });
        break;
      case JEWEL_SPELL_TYPE.BASHING_STRIKE:
        effect = this.effects.stun;
        if (effect) {
          effect.timer.setTime(2);
        } else {
          effect = new StunEffect({
            activeTime: 2,
            effectType: "stun",
            board: this,
            animKey: "stunEffect",
          });
        }
        break;
      case JEWEL_SPELL_TYPE.LITURGY:
        effect =
          this.effects.liturgy ||
          new LiturgyEffect({
            activeTime: 10,
            effectType: "liturgy",
            board: this,
            animKey: "liturgyEffect",
          });
        break;

      default:
        return;
    }
    if (!effect) return;
    if (!this.effects[effect.effectType]) {
      this.effects[effect.effectType] = effect;
      this.effectKeys.push(effect.effectType);
    }
    if (!effect.isActive) {
      effect.activate();
    }

    if (effect.isActive && anim) {
      anim.play();
      this.UI?.animations?.push(anim);
    }
  }

  private compareTypes(type1: number, type2: number) {
    if (type1 === 0 || type2 === 0) {
      return false;
    }
    if (type1 < 7 && type2 < 7) {
      return type1 === type2;
    }
    const converted1 = JEWEL_SPELL_CONVERSION[type1]?.parentType || type1;
    const converted2 = JEWEL_SPELL_CONVERSION[type2]?.parentType || type2;
    return converted1 === converted2;
  }
  /**
   * BFS like algorithm to get matches from position.
   * It checks all neighbours and places all matching candidates into rows and cols
   * Then we convert potential matches and return them as a number[]
   */

  private getMatches(startInd: number) {
    const type = this.jewels[startInd].jewelType;
    const byRow: Record<number, Set<number>> = {};
    const byCol: Record<number, Set<number>> = {};
    const queue: number[] = [startInd];
    const seen: Record<number, boolean> = {};
    const { row: startRow, col: startCol } = convertTo2dInd(
      startInd,
      this.rows,
      this.cols,
    );
    byRow[startRow] = new Set([startInd]);
    byCol[startCol] = new Set([startInd]);

    while (queue.length) {
      const curr = queue.pop();
      if (curr === undefined) continue;
      for (let neighborInd of this.getNeighorIndices(curr)) {
        const jewel = this.jewels[neighborInd];
        if (
          this.compareTypes(jewel.jewelType, type) &&
          jewel.isMatchable() &&
          !seen[neighborInd]
        ) {
          const { row, col } = convertTo2dInd(
            neighborInd,
            this.rows,
            this.cols,
          );
          if (byRow[row]) {
            byRow[row].add(neighborInd);
          } else {
            byRow[row] = new Set([neighborInd]);
          }
          if (byCol[col]) {
            byCol[col].add(neighborInd);
          } else {
            byCol[col] = new Set([neighborInd]);
          }

          queue.push(neighborInd);
        }
        seen[curr] = true;
      }
    }
    const matches: number[] = [];
    Object.values(byRow).forEach((set) => {
      matches.push(...this.convertSetToMatchedIndices(set, 1));
    });
    Object.values(byCol).forEach((set) => {
      matches.push(...this.convertSetToMatchedIndices(set, this.cols));
    });
    // if (matches.length) {
    //   console.log([...new Set(matches)]);
    //   console.log(byCol);
    //   console.log(byRow);
    // }

    return [...new Set(matches)];
  }

  private convertSetToMatchedIndices(set: Set<number>, step: number) {
    if (set.size < 3) return [];
    const vals = [...set].sort((a, b) => a - b);
    let prev = vals[0];
    for (let i = 1; i < vals.length; i++) {
      const diff = Math.abs(vals[i] - prev);
      prev = vals[i];
      if (diff !== step) return [];
    }
    return vals;
  }

  getNeighorIndices(ind: number) {
    const indices = [];
    const { row } = convertTo2dInd(ind, this.rows, this.cols);

    if (
      this.jewels[ind + 1] &&
      convertTo2dInd(ind + 1, this.rows, this.cols).row === row
    ) {
      indices.push(ind + 1);
    }
    if (
      this.jewels[ind - 1] &&
      convertTo2dInd(ind - 1, this.rows, this.cols).row === row
    ) {
      indices.push(ind - 1);
    }
    if (this.jewels[ind - this.cols]) {
      indices.push(ind - this.cols);
    }
    if (this.jewels[ind + this.cols]) {
      indices.push(ind + this.cols);
    }

    return indices;
  }

  swapJewels(ind1: number, ind2: number) {
    [this.jewels[ind1], this.jewels[ind2]] = [
      this.jewels[ind2],
      this.jewels[ind1],
    ];
    this.jewels[ind1].swap(this.jewels[ind2]);
  }

  removeOrMerge(matches: Matches) {
    if (!this.isMatchesLegal(matches)) {
      return;
    }

    if (matches.length === 3) {
      this.removeLine(matches);
    }
    if (matches.length > 3) {
      this.mergeLine(matches);
    }
  }

  removeLine(indices: number[]) {
    indices.sort((a, b) => a - b);

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      const jewel = this.jewels[currInd];
      this.removeJewel(jewel);
      this.castProjectile(jewel.jewelType, { ...jewel.position });
    }
  }

  private castProjectile(jewelType: number, originPos: Coords) {
    const ent = new AttackProjectile({
      damageOnHit: 10,
      board: this,
      jewelType: jewelType,
      position: originPos,
    });

    ent.cast();
    this.spellsToCast.push(ent);
  }

  private removeJewel(jewel: Jewel) {
    jewel.remove();
    const removalAnim = createAnimationWithSprite(
      jewel.position,
      "jewelRemove_" + jewel.jewelParentType,
      jewel.size,
    );
    removalAnim.play();
    this.UI?.animations?.push(removalAnim);
    if (jewel.isSpell) {
      this.changeChargeLevel(10);
      this.createSpell(jewel);
    }
  }

  changeChargeLevel(val: number) {
    this.chargeLevel += val;
    if (this.chargeLevel <= 0) {
      this.chargeLevel = 0;
    }
    if (this.chargeLevel >= 100) {
      this.chargeLevel = 100;
    }
  }

  /**
   * Returns numeric array that represents current jewels
   * @param [isNormalized=false] keep spell types, otherwise covert them into parent types
   */
  getLayout(isNormalized = false) {
    const result: number[] = [];
    for (let i = 0; i < this.jewels.length; i++) {
      const jewel = this.jewels[i];
      result[i] = jewel.jewelType;

      if (isNormalized && jewel.isSpell) {
        result[i] = jewel.jewelParentType;
      }
    }
    return result;
  }

  reset() {
    this.health = this.totalHealth;
    this.recalculateHealthPercent();
    this.spellsToCast = [];
    this.jewels = [];
    this.isFalling = false;
    this.chargeLevel = 0;
    this.isReadyToRefill = false;
    this.UI?.reset();
    this.effects = {};
    this.effectKeys = [];
    this.isNewBoard = true;
  }

  createSpell(jewel: Jewel) {
    let spell: Spell | undefined;
    const spellType = jewel.jewelType;
    switch (spellType) {
      case JEWEL_SPELL_TYPE.STUN:
        spell = new StunSpell({
          position: this.getBoardCenter(),
          board: this,
          spellType: spellType.toString(),
        });
        break;
      case JEWEL_SPELL_TYPE.VAMPIRE:
        spell = new VampiricSpell({
          position: this.getBoardCenter(),
          board: this,
          spellType: spellType.toString(),
        });
        break;
      case JEWEL_SPELL_TYPE.POISON:
        spell = new PoisonSpell({
          position: this.getBoardCenter(),
          board: this,
          spellType: spellType.toString(),
        });
        break;
      case JEWEL_SPELL_TYPE.SHIELD:
        spell = new ShieldSpell({
          position: this.getBoardCenter(),
          board: this,
          spellType: spellType.toString(),
        });
        break;

      case JEWEL_SPELL_TYPE.EXPLOSION:
        spell = new ExplosionSpell({
          position: jewel.getIndexPos(),
          board: this,
          spellType: spellType.toString(),
          originInd: jewel.index,
        });
        break;

      case JEWEL_SPELL_TYPE.CRIT_STRIKE:
        spell = new CritStrike({
          board: this,
          spellType: spellType.toString(),
        });
        break;
      case JEWEL_SPELL_TYPE.FATIGUE:
        spell = new FatigueSpell({
          board: this,
          spellType: spellType.toString(),
          position: this.getBoardCenter(),
        });
        break;
      case JEWEL_SPELL_TYPE.DRILL_STRIKE:
        spell = new DrillStrikeSpell({
          board: this,
          spellType: spellType.toString(),
          position: jewel.getIndexPos(),
        });
        break;
      case JEWEL_SPELL_TYPE.BASHING_STRIKE:
        spell = new BashStrikeSpell({
          board: this,
          spellType: spellType.toString(),
          position: jewel.getIndexPos(),
        });
        break;
      case JEWEL_SPELL_TYPE.LITURGY:
        this.applyEffect(JEWEL_SPELL_TYPE.LITURGY);
        break;
      case JEWEL_SPELL_TYPE.CONTAMINATION:
        spell = new ContaminationSpell({
          board: this,
          spellType: spellType.toString(),
          position: jewel.getIndexPos(),
        });
        break;
      case JEWEL_SPELL_TYPE.MINEFIELD:
        spell = new MinefieldSpell({
          board: this,
          spellType: spellType.toString(),
          position: jewel.getIndexPos(),
          originInd: jewel.index,
        });
        break;

      default:
        console.warn(`Spell: ${spellType} not found`);
    }
    if (!spell) {
      return;
    }
    spell.cast();
    this.spellsToCast.push(spell);
  }

  getBoardCenter() {
    return getCenter(this.position, this.size);
  }

  private findConversion(type: number, matches: number) {
    const found = Object.keys(JEWEL_SPELL_CONVERSION)
      .sort(
        (a, b) =>
          JEWEL_SPELL_CONVERSION[b].matchesToGet -
          JEWEL_SPELL_CONVERSION[a].matchesToGet,
      )
      .find((key) => {
        const item = JEWEL_SPELL_CONVERSION[key];
        return item.parentType === type && item.matchesToGet <= matches;
      });

    return found ? +found : 0;
  }

  mergeLine(indices: number[], mergeIndex = -1) {
    indices.sort((a, b) => a - b);
    const mergeInd =
      mergeIndex > -1 ? mergeIndex : Math.floor(indices.length >> 1) - 1;
    const type = this.jewels[indices[mergeInd]].jewelParentType;
    const matches = indices.length;

    const mergeTo = this.findConversion(type, matches);

    for (let i = 0; i < indices.length; i++) {
      const currInd = indices[i];
      if (i === mergeInd) {
        const jewel = this.jewels[currInd];
        if (jewel.isSpell) {
          this.changeChargeLevel(10);
          this.createSpell(jewel);
        }

        jewel.convertTo(mergeTo);
        const convertAnim = createAnimationWithSprite(
          jewel.position,
          "jewelConvert",
          jewel.size,
        );
        this.UI?.animations?.push(convertAnim);
        convertAnim.play();
      } else {
        this.jewels[currInd].mergeTo(
          this.jewels[indices[mergeInd]].getIndexPos(),
        );
        if (this.jewels[currInd].isSpell) {
          this.changeChargeLevel(10);
          this.createSpell(this.jewels[currInd]);
        }
        this.changeChargeLevel(1);
        this.castProjectile(this.jewels[currInd].jewelType, {
          ...this.jewels[currInd].position,
        });
      }
    }
  }

  attemptSwap(ind1: number, ind2: number) {
    if (this.effects["stun"]?.isActive) return false;
    if (ind1 === ind2) return false;
    if (!this.jewels[ind1] || !this.jewels[ind2]) return false;

    if (!this.jewels[ind1].isSwappable() || !this.jewels[ind2].isSwappable()) {
      return false;
    }
    const { col: ind1Col, row: ind1Row } = convertTo2dInd(
      ind1,
      this.rows,
      this.cols,
    );
    const { col: ind2Col, row: ind2Row } = convertTo2dInd(
      ind2,
      this.rows,
      this.cols,
    );
    if (ind1Col !== ind2Col && ind1Row !== ind2Row) return false;
    const rowDelta = Math.abs(ind1Row - ind2Row);
    const colDelta = Math.abs(ind1Col - ind2Col);
    if (ind1Col === ind2Col && rowDelta > 1) return false;
    if (ind1Row === ind2Row && colDelta > 1) return false;
    this.swapJewels(ind1, ind2);

    const matches1 = this.getMatches(ind1).filter(
      (ind) => !this.isCollapsingUnder(ind),
    );
    const matches2 = this.getMatches(ind2).filter(
      (ind) => !this.isCollapsingUnder(ind),
    );

    if (!this.isMatchesLegal(matches1) && !this.isMatchesLegal(matches2)) {
      this.swapJewels(ind1, ind2);
      return false;
    }

    this.currentSwapping = this.jewels[ind1];

    return true;
  }

  // check if current jewel is on the column that is collapsing underneath
  private isCollapsingUnder(ind: number) {
    let currentInd = ind + this.cols;
    while (currentInd < this.jewels.length) {
      const jewel = this.jewels[currentInd];
      if (jewel.isRemoving || jewel.isMerging || jewel.isDisabled) {
        return true;
      }
      currentInd += this.cols;
    }
    return false;
  }

  private isMatchesLegal(matches: Matches) {
    return matches.length >= 3;
  }

  removeOrMergeMatches() {
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      if (this.jewels[i].isMatchable()) {
        const matches = this.getMatches(i);
        this.removeOrMerge(matches);
      }
    }
  }

  shakeBoard() {}

  private moveLineDown(startInd: number) {
    //start swapping element from bottom up in order

    let elementInd = startInd - this.cols;
    while (startInd >= 0 && elementInd >= 0) {
      const el1 = this.jewels[startInd];
      const el2 = this.jewels[elementInd];

      if (el2.isMerging) return;

      if (el1.jewelType === 0 && el2.jewelType !== 0) {
        // swap elements
        this.jewels[elementInd].index = startInd;
        this.jewels[elementInd].setFalling(
          this.jewels[elementInd].getIndexPos(),
        );
        this.indicesToFall.push(startInd);
        [this.jewels[startInd], this.jewels[elementInd]] = [
          this.jewels[elementInd],
          this.jewels[startInd],
        ];

        // advance both indices one row higher
        startInd = startInd - this.cols;
        elementInd = elementInd - this.cols;
      } else {
        // advance only second index
        elementInd = elementInd - this.cols;
      }
    }
    this.isReadyToRefill = true;
  }

  moveJewelsDown() {
    // find deepest empty spot
    for (let i = this.jewels.length - 1; i >= 0; i--) {
      if (this.jewels[i].jewelType === 0) {
        this.moveLineDown(i);
      }
    }
  }

  checkCollision() {
    for (let i = 0; i < this.jewels.length; i++) {
      const jewel1 = this.jewels[i];
      jewel1.checkWallCollision();
      for (let j = 0; j < this.jewels.length; j++) {
        const currJewel = this.jewels[j];

        if (jewel1 !== currJewel) {
          jewel1.checkCollision(currJewel);
        }
      }
    }
  }

  private createJewel(
    i: number,
    type: number,
    totalRows: number,
    isPhysicalized: boolean,
  ) {
    const { row, col } = convertTo2dInd(i, this.rows, this.cols);
    const x = this.position.x + this.jewelSize.width * col;
    const jewelPos: Coords = {
      x,
      y:
        this.position.y -
        this.jewelSize.height * (totalRows - row + 1) -
        (isPhysicalized ? Math.random() * 10 : 0),
    };
    const jewel = new Jewel({
      size: { ...this.jewelSize },
      position: jewelPos,
      jewelType: type || 0,
      boardPos: this.position,
      boardSize: this.size,
      boardCols: this.cols,
      boardRows: this.rows,
      index: i,
    });

    jewel.setFalling(
      { x, y: this.position.y + this.jewelSize.height * row },
      isPhysicalized,
    );
    return jewel;
  }

  generateJewels(layout: number[], isGameStart = false, totalRows: number = 8) {
    for (let i = 0; i < layout.length; i++) {
      const currType = layout[i];
      if (currType < 1) continue;
      const jewel = this.createJewel(i, currType, totalRows, isGameStart);
      this.indicesToFall.push(i);
      this.jewels[i] = jewel;
    }
    this.isFalling = true;
  }

  private updateFalling() {
    for (let i = 0; i < this.indicesToFall.length; i++) {
      const jewel = this.jewels[this.indicesToFall[i]];
      if (jewel && !jewel.isFalling) {
        this.indicesToFall[i] = -1;
      }
    }

    this.indicesToFall = this.indicesToFall.filter((item) => item !== -1);
    if (!this.indicesToFall.length) {
      this.isFalling = false;
      if (!this.isNewBoard) {
        this.removeOrMergeMatches();
      }
    }
  }

  private updateSpells(t: number, dt: number) {
    let endedSpellExists = false;
    for (let i = 0; i < this.spellsToCast.length; i++) {
      const spell = this.spellsToCast[i];
      spell.update(t, dt);
      endedSpellExists = spell.isFinished;
    }
    if (endedSpellExists) {
      this.spellsToCast = this.spellsToCast.filter((spell) => spell.isCasting);
    }
  }

  private updateEffects(t: number, dt: number) {
    for (let i = 0; i < this.effectKeys.length; i++) {
      const currEffect = this.effects[this.effectKeys[i]];
      currEffect.update(t, dt);
    }
  }

  update(t: number, dt: number) {
    if (this.currentSwapping && !this.currentSwapping.isSwapping) {
      this.currentSwapping = undefined;
      this.removeOrMergeMatches();
    }
    let disabledExist = false;
    for (let i = 0; i < this.jewels.length; i++) {
      const jewel = this.jewels[i];
      jewel.update(t, dt);

      if (jewel.isDisabled || jewel.jewelType === 0) {
        disabledExist = true;
      }
    }
    this.updateSpells(t, dt);
    this.updateEffects(t, dt);
    this.checkCollision();

    if (this.isFalling) {
      this.updateFalling();
    }

    if (disabledExist) {
      this.moveJewelsDown();
    }
  }
}
