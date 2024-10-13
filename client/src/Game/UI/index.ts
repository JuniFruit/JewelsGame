import { FONT, FontWeight } from "../assets/fonts/fonts";
import { DEFAULT_FONT_SIZE } from "../config";
import { Coords, InteractableEntity } from "../sharedEntities";
import { ScreenLayout } from "./screens";

export class UI {
  screens: Map<string, ScreenLayout> = new Map();
  ctx: CanvasRenderingContext2D;
  currentScreen = "";
  currentElements: ScreenLayout["elements"] = [];
  fontSize = DEFAULT_FONT_SIZE;
  fontFamily = "";
  fontWeight = "";
  currentFont = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
  currentHoveredElement: InteractableEntity | undefined;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  private beforeScreenChange() {
    this.currentHoveredElement = undefined;
  }

  setCurrentScreen(key: string) {
    if (!this.screens.has(key)) {
      console.warn("No screen with name " + key + " found");
      return;
    }
    const screen = this.screens.get(key);
    this.beforeScreenChange();
    this.currentScreen = screen!.screenName;
    this.currentElements = screen!.elements;
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
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseDown(mousePos);
    }
  }

  mouseUp(mousePos: Coords) {
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseUp(mousePos);
    }
  }

  private findElement(
    accessor: string,
    val: string,
  ): InteractableEntity | undefined {
    const stack = [...this.currentElements];
    while (stack.length) {
      const curr = stack.pop();
      if ((curr as any)?.[accessor] === val) {
        return curr;
      }
      if (curr) {
        stack.push(...curr.children);
      }
    }
    return;
  }

  getElementById(id: string) {
    return this.findElement("id", id);
  }

  getElementByText(val: string) {
    return this.findElement("text", val);
  }

  mouseOut(mousePos: Coords) {
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseOut(mousePos);
    }
  }

  checkIsMouseIntersecting(mousePos: Coords) {
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
    for (let i = 0; i < this.currentElements.length; i++) {
      this.currentElements[i].update(t, dt);
    }
  }

  draw() {
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
