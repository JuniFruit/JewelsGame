import { UI } from "..";
import { DEFAULT_BUTTON_THEME } from "../../config";
import { Game } from "../../game";
import { Button } from "../button";
import { FlexContainer } from "../flexContainer";

export function mainMenuButtons(
  ctx: CanvasRenderingContext2D,
  ui: UI,
  game: Game,
) {
  return [
    new FlexContainer({
      children: [
        new Button({
          position: {
            x: 0,
            y: 0,
          },
          ctx,
          ...DEFAULT_BUTTON_THEME,
          text: "Solo game",
          padding: 10,
          size: { width: 150, height: 50 },
          onClick: () => {
            ui.setCurrentScreen("solo_game");
            game.setGameMode("singleplayer");
          },
        }),
        new Button({
          position: {
            x: 0,
            y: 0,
          },
          ctx,
          ...DEFAULT_BUTTON_THEME,
          text: "Settings",
          padding: 10,
        }),
      ],
      direction: "column",
      gap: 30,
      isOriginCentered: false,
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: ctx.canvas.getBoundingClientRect().width,
        height: ctx.canvas.getBoundingClientRect().height,
      },
    }),
  ];
}
