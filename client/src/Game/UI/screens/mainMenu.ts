import { UI } from "..";
import { DEFAULT_BUTTON_THEME } from "../../config";
import { Button } from "../button";

export function mainMenuButtons(ctx: CanvasRenderingContext2D, ui: UI) {
  console.log(ctx.canvas.getBoundingClientRect().x);
  return [
    new Button({
      position: {
        x: 0 + ctx.canvas.getBoundingClientRect().width / 2,
        y: 200,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Solo game",
      padding: 10,
      fontSize: "20px",
      onClick: () => ui.setCurrentScreen("solo_game"),
    }),
    new Button({
      position: {
        x: ctx.canvas.width * 0.5,
        y: 70,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Settings",
      padding: 10,
      fontSize: "10px",
    }),
  ];
}
