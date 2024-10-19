import { createAnimationWithSprite } from "../animation";
import { JEWEL_SPELL_TYPE } from "../config";
import { detectCollision, pickRnd } from "../utils";
import { Spell, SpellProps } from "./base";

export type BashStrikeSpellProps = Omit<SpellProps, "size"> & {};

export class BashStrikeSpell extends Spell {
  private movingFactor = 1.2;
  private bashes = 3;
  private currTarget: "board" | "jewel" = "board";
  private targetInd: number = -1;
  constructor({ ...rest }: BashStrikeSpellProps) {
    super({ size: { width: 20, height: 20 }, ...rest });
    this.animation = createAnimationWithSprite(
      this.position,
      "bashStrikeEffect",
      undefined,
      0,
      this.size,
    );
    this.animation.sprite?.rescale(3.5);
  }

  cast(): void {
    this.reset();
    if (!this.board.opponentBoard) return;
    this.moveToBoard();
    this.animation.play();
    this.isCasting = true;
  }

  private moveToJewel() {
    this.board.opponentBoard?.applyEffect(JEWEL_SPELL_TYPE.BASHING_STRIKE);
    this.board.opponentBoard?.applyDamage(3);
    this.bashes -= 1;
    const rndJewel =
      this.board.jewels[pickRnd(0, this.board.jewels.length - 1)];
    const jewelPos = rndJewel.getIndexPos();
    const jewelPosCenter = {
      x: jewelPos.x + rndJewel.size.width * 0.5,
      y: jewelPos.y + rndJewel.size.height * 0.5,
    };
    this.moveTo(jewelPosCenter, this.movingFactor, Infinity);
    this.currTarget = "jewel";
    this.targetInd = rndJewel.index;
  }

  private moveToBoard() {
    if (this.board.jewels[this.targetInd]?.isMatchable()) {
      this.board.removeLine([this.targetInd]);
    }

    this.moveTo(
      this.board.opponentBoard!.getBoardCenter(),
      this.movingFactor,
      Infinity,
    );

    this.currTarget = "board";
  }

  private checkCollision() {
    if (!this.board.opponentBoard) return;
    if (this.currTarget === "board") {
      if (
        detectCollision(
          this.position,
          this.size,
          this.board.opponentBoard.getBoardCenter(),
          this.board.opponentBoard.size,
        )
      ) {
        this.moveToJewel();
      }
      return;
    }
    if (this.currTarget === "jewel") {
      if (
        detectCollision(
          this.position,
          this.size,
          this.targetPosition,
          this.board.jewels[this.targetInd].size,
        )
      ) {
        this.moveToBoard();
      }
      return;
    }
  }

  update(t: number, dt: number): void {
    if (!this.isCasting) return;
    if (this.isMoving) {
      this.updateMoving(dt);
    }
    this.animation.update(t, dt);
    this.checkCollision();
    if (this.bashes <= 0) {
      this.stopCasting();
    }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    this.animation.draw(ctx);
  }
}
