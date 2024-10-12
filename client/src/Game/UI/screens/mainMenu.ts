import { UI } from "..";
import { DEFAULT_BUTTON_THEME } from "../../config";
import { Game } from "../../game";
import { Button } from "../button";

export function mainMenuButtons(
  ctx: CanvasRenderingContext2D,
  ui: UI,
  game: Game,
) {
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
      onClick: () => {
        ui.setCurrentScreen("solo_game");
        game.setGameMode("singleplayer");
      },
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
    }),
  ];
}
