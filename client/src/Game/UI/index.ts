import { FONT, FontWeight } from "../assets/fonts/fonts";
import { DEFAULT_FONT_SIZE } from "../config";
import { Game } from "../Game";
import { Coords, InteractableEntity } from "../sharedEntities";
import { BoardUI } from "./boardUI";

export type ScreenLayout = {
  screenName: string;
  background: string;
  elements: InteractableEntity[];
};

export class UI {
  screens: Map<string, ScreenLayout> = new Map();
  ctx: CanvasRenderingContext2D;
  currentScreen = "";
  currentElements: ScreenLayout["elements"] = [];
  fontSize = DEFAULT_FONT_SIZE;
  fontFamily = "Arial";
  fontWeight = "light";
  currentFont = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
  currentHoveredElement: InteractableEntity | undefined;
  p1BoardUI: BoardUI | undefined;
  p2BoardUI: BoardUI | undefined;
  game: Game | undefined;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setCurrentScreen(key: string) {
    if (!this.screens.has(key)) {
      console.warn("No screen with name " + key + " found");
      return;
    }
    const screen = this.screens.get(key);
    this.currentScreen = screen!.screenName;
    this.currentElements = screen!.elements;
    if (key === "game") {
      this.initUIBoards();
    }
  }

  private initUIBoards() {
    if (!this.game) return;
    this.p1BoardUI = new BoardUI({
      board: this.game.p1Board,
    });
    this.p2BoardUI = new BoardUI({
      board: this.game.p2Board,
    });
    this.game.p1Board.UI = this.p1BoardUI;
    this.game.p2Board.UI = this.p2BoardUI;
  }

  setCurrentFont(weight: FontWeight, family: string, size = DEFAULT_FONT_SIZE) {
    this.currentFont = `${weight} ${size} ${family}`;
    this.fontSize = size;
    this.fontFamily = family;
    this.fontWeight = weight;
  }

  drawFont() {
    this.ctx.font = this.currentFont;
  }

  addScreen(key: string, layout: ScreenLayout) {
    this.screens.set(key, layout);
  }

  mouseDown(mousePos: Coords) {
    this.p1BoardUI?.mouseDown(mousePos);
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseDown(mousePos);
    }
  }

  mouseUp(mousePos: Coords) {
    this.p1BoardUI?.mouseUp(mousePos);

    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseUp(mousePos);
    }
  }

  mouseOut(mousePos: Coords) {
    this.p1BoardUI?.mouseOut(mousePos);
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseOut(mousePos);
    }
  }

  checkIsMouseIntersecting(mousePos: Coords) {
    if (this.p1BoardUI) {
      this.p1BoardUI.mouseMove(mousePos);
    }
    // if (this.game?.p2Board) {
    //   this.game.p2Board.checkIsHovered(mousePos);
    // }
    if (
      this.currentHoveredElement &&
      this.currentHoveredElement.checkIsHovered(mousePos)
    ) {
      return;
    }
    this.currentHoveredElement = undefined;
    for (let i = 0; i < this.currentElements.length; i++) {
      if (this.currentElements[i].checkIsHovered(mousePos)) {
        this.currentHoveredElement = this.currentElements[i];
        break;
      }
    }
  }

  update(t: number, dt: number) {
    if (this.currentScreen === "game") {
      this.p1BoardUI?.update(t, dt);
      this.p2BoardUI?.update(t, dt);
    }
  }

  drawGame() {
    if (!this.p1BoardUI || !this.p2BoardUI) return;
    this.p1BoardUI.draw(this.ctx);
    this.p2BoardUI.draw(this.ctx);
    this.p1BoardUI.drawAnimations(this.ctx);
    this.p2BoardUI.drawAnimations(this.ctx);
  }

  draw() {
    if (this.currentScreen === "game") {
      this.drawGame();
    }
    for (let i = 0; i < this.currentElements.length; i++) {
      this.currentElements[i].draw(this.ctx);
    }
  }
}

export async function initFonts(ui: UI) {
  const fontPromises = FONT.styles.map(async (font) => {
    const newFont = new FontFace(FONT.family, `url(${font.src})`, {
      weight: font.weight,
    });
    try {
      await newFont.load();
      document.fonts.add(newFont);
      if (font.useAsDefault) {
        ui.setCurrentFont(font.weight, FONT.family);
      }
    } catch (error) {
      console.warn("Failed to load font: " + error);
    }
  });
  await Promise.all(fontPromises);
}
