import { Animation } from "../animation";
import { MOUSE_SIZE } from "../config";
import { Board } from "../game/board";
import { Jewel } from "../game/jewel";
import {
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
} from "../sharedEntities";
import { detectCollision } from "../utils";
import { ChargeBar } from "./chargeBar";
import { HealthBar } from "./healthbar";

export type JewelUIProps = Omit<BaseEntityProps, "type"> & {};

export class JewelUI extends InteractableEntity {
  constructor({ ...rest }: JewelUIProps) {
    super({ type: "jewelUI", ...rest });
  }
}

export type BoardUIProps = {
  board: Board;
};

export class BoardUI extends InteractableEntity {
  healthBar: HealthBar;
  chargeBar: ChargeBar;
  private hoveredInd = -1;
  private selectedInd = -1;
  private currentDraggingInd = -1;
  private board: Board;
  animations: Animation[] = [];

  constructor({ board }: BoardUIProps) {
    super({
      position: board.position,
      size: board.size,
      type: "boardUI",
    });
    this.board = board;
    this.healthBar = this.initHealthBar();
    this.chargeBar = this.initChargeBar();
  }

  reset() {
    this.animations = [];
    this.healthBar.reset();
    this.resetMouseStates();
    this.resetDragging();
    this.resetSwappingIndices();
  }

  private initChargeBar() {
    const margin = 80;
    const height = 20;
    const position: Coords = {
      x: this.position.x,
      y: this.position.y + this.size.height + margin,
    };
    const size: Size = {
      width: this.size.width,
      height,
    };

    return new ChargeBar({
      position,
      size,
      board: this.board,
    });
  }

  private initHealthBar() {
    const margin = 30;
    const height = 40;
    const position: Coords = {
      x: this.position.x,
      y: this.position.y + this.size.height + margin,
    };
    const size: Size = {
      width: this.size.width,
      height,
    };
    return new HealthBar({
      position,
      size,
      board: this.board,
      player: this.board.player,
    });
  }

  private updateDragging(mousePos: Coords) {
    if (this.currentDraggingInd < 0) return;
    this.board.jewels[this.currentDraggingInd].dragTo(mousePos);
  }

  mouseDown(mousePos: Coords) {
    if (this.hoveredInd > -1) {
      const currJewel = this.board.jewels[this.hoveredInd];
      currJewel.mouseDown(mousePos);
      currJewel.resetMouseStates();
      currJewel.setDragging(true);
      this.currentDraggingInd = this.hoveredInd;
    }
  }

  private resetDragging() {
    if (this.currentDraggingInd > -1) {
      const currentDragging = this.board.jewels[this.currentDraggingInd];
      currentDragging.setDragging(false);
      if (!currentDragging.isMerging) {
        currentDragging.moveToIndPos();
      }
    }
    if (this.selectedInd > -1) {
      const otherJewel = this.board.jewels[this.selectedInd];

      otherJewel.moveTo(otherJewel.getIndexPos());
    }
    this.resetSwappingIndices();
  }

  mouseUp(_mousePos: Coords) {
    if (this.selectedInd === this.currentDraggingInd || this.selectedInd < 0) {
      this.resetDragging();
    }

    if (this.selectedInd > -1) {
      const isSuccess = this.board.attemptSwap(
        this.selectedInd,
        this.currentDraggingInd,
      );
      if (isSuccess) this.selectedInd = -1;
      this.resetDragging();

      return;
    }
  }

  mouseOut(mousePos: Coords) {
    this.mouseUp(mousePos);
  }

  private resetSwappingIndices() {
    this.selectedInd = -1;
    this.currentDraggingInd = -1;
    this.hoveredInd = -1;
  }

  mouseMove(mousePos: Coords) {
    this.updateDragging(mousePos);
    if (
      this.hoveredInd > -1 &&
      this.board.jewels[this.hoveredInd].checkIsHovered(mousePos)
    ) {
      return;
    }

    this.hoveredInd = -1;

    if (!detectCollision(this.position, this.size, mousePos, MOUSE_SIZE)) {
      return;
    }
    for (let i = 0; i < this.board.jewels.length; i++) {
      const curr = this.board.jewels[i];
      if (curr.checkIsHovered(mousePos)) {
        this.hoveredInd = i;
        return;
      }
    }
  }

  private checkDraggingCollisions() {
    for (let i = 0; i < this.board.jewels.length; i++) {
      const jewel1 = this.board.jewels[i];
      for (let j = 0; j < this.board.jewels.length; j++) {
        const currJewel = this.board.jewels[j];

        if (jewel1.isDragging && jewel1 !== currJewel) {
          if (jewel1.checkDraggingCollision(currJewel)) {
            const currentDraggingPos = jewel1.getIndexPos();
            if (
              currJewel.targetPosition.x !== currentDraggingPos.x ||
              currentDraggingPos.y !== currJewel.targetPosition.y
            ) {
              currJewel.moveTo(currentDraggingPos);
              this.selectedInd = j;
            } else {
              currJewel.moveToIndPos();
              this.selectedInd = this.currentDraggingInd;
            }
          }
        }
      }
    }
  }

  private updateAnimations(t: number, dt: number) {
    let endedAnimationExists = false;
    for (let i = 0; i < this.animations.length; i++) {
      const anim = this.animations[i];
      anim.update(t, dt);
      endedAnimationExists = !anim.isAnimating;
    }
    if (endedAnimationExists) {
      this.animations = this.animations.filter((anim) => anim.isAnimating);
    }
  }

  update(t: number, dt: number) {
    this.healthBar.update(t, dt);
    this.chargeBar.update(t, dt);
    if (this.animations.length) {
      this.updateAnimations(t, dt);
    }
    if (this.currentDraggingInd > -1) {
      this.checkDraggingCollisions();
    }
  }

  drawAnimations(ctx: CanvasRenderingContext2D) {
    for (let anim of this.animations) {
      anim.draw(ctx);
    }
    for (let spell of this.board.spellsToCast) {
      spell.draw(ctx);
    }

    for (let effectKey of this.board.effectKeys) {
      this.board.effects[effectKey].draw(ctx);
    }
  }

  private drawEffectInfo(ctx: CanvasRenderingContext2D) {
    const prevStyle = ctx.font;
    ctx.font = "bold 15px Arial";
    for (let i = 0; i < this.board.effectKeys.length; i++) {
      const effectKey = this.board.effectKeys[i];
      const effect = this.board.effects[effectKey];
      if (effect.isActive) {
        const y = i * 50 + 100;
        const x =
          this.board.player === "p1"
            ? this.board.position.x + this.board.size.width + 20
            : this.board.position.x - 90;

        ctx.fillText(`${effect.effectType}`, x, y);
        ctx.fillText(
          `T: ${Math.trunc(effect.timer.timeLeft)} ${effectKey === "shield" ? "S: " + (effect as any).stacks : ""}`,
          x,
          y + 20,
        );
      }
    }
    ctx.font = prevStyle;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let draggingEnt: Jewel | undefined;
    let convertingEnt: Jewel | undefined;
    ctx.fillStyle = "black";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.healthBar.draw(ctx);
    this.chargeBar.draw(ctx);
    this.drawEffectInfo(ctx);
    for (let jewelEnt of this.board.jewels) {
      if (jewelEnt.isDragging) {
        draggingEnt = jewelEnt;
      } else if (jewelEnt.isConverting) {
        convertingEnt = jewelEnt;
      } else {
        jewelEnt.draw(ctx);
      }
    }
    if (convertingEnt) {
      convertingEnt.draw(ctx);
    }
    if (draggingEnt) {
      draggingEnt.draw(ctx);
    }
  }
}
