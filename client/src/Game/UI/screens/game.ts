import { UI } from "..";
import { DEFAULT_BUTTON_THEME } from "../../config";
import { Game } from "../../game";
import { Debug } from "../../utils";
import { Button } from "../button";
import { FlexContainer } from "../flexContainer";
import { InGameUI } from "../inGameUI";

export function inSoloGameButtons(
  ctx: CanvasRenderingContext2D,
  ui: UI,
  game: Game,
) {
  const gameUi = new InGameUI({ game, ui });
  return [
    gameUi,
    new FlexContainer({
      children: [
        new Button({
          position: {
            x: 0,
            y: 0,
          },
          ctx,
          ...DEFAULT_BUTTON_THEME,
          text: "Start game",
          padding: 10,
          disabled: game.isStarted,
          onClick: (btn) => {
            game.startGame();
            btn.disable();
          },
        }),
        new Button({
          position: {
            x: 0,
            y: 0,
          },
          ctx,
          ...DEFAULT_BUTTON_THEME,
          text: game.isPaused ? "Unpause" : "Pause",
          padding: 10,
          disabled: game.isPaused,
          onClick: (btn) => {
            game.setPause(!game.isPaused);
            btn.setText(game.isPaused ? "Unpause" : "Pause");
          },
        }),
        new Button({
          position: {
            x: 0,
            y: 0,
          },
          ctx,
          ...DEFAULT_BUTTON_THEME,
          text: "Quit",
          padding: 10,
          onClick: () => {
            (ui.getElementByText("Start game") as Button)?.activate();
            ui.setCurrentScreen("main_menu");
            game.reset();
          },
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

export function debugButtons(
  ctx: CanvasRenderingContext2D,
  debugInstance: Debug,
) {
  return [
    new Button({
      position: {
        x: 450,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Create board",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.setTestBoards(),
    }),
    new Button({
      position: {
        x: 550,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "FPS throttle",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.toggleFPSThrottle(),
    }),
    new Button({
      position: {
        x: 650,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Generate set board",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.setTestBoards(false),
    }),
    new Button({
      position: {
        x: 650,
        y: 80,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Jewel info",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.toggleJewelsDebug(),
    }),
    new Button({
      position: {
        x: 550,
        y: 80,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Slow time",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.slowTime(),
    }),
    new Button({
      position: {
        x: 550,
        y: 115,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Disable AI",
      padding: 10,
      fontSize: "10px",
      onClick: () => {
        debugInstance.game.AI = undefined;
      },
    }),
  ];
}
