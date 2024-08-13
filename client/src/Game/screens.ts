import { DEFAULT_BUTTON_THEME } from "./config";
import { Game } from "./Game";
import { Button, ScreenLayout, UI } from "./UI";
import { Debug } from "./utils";

export function initGameScreens(
  ui: UI,
  game: Game,
  ctx: CanvasRenderingContext2D,
  debugInstance?: Debug,
) {
  const canvas = ctx.canvas;

  const screens: ScreenLayout[] = [
    {
      screenName: "game",
      background: "",
      elements: [...(debugInstance ? debugButtons(ctx, debugInstance!) : [])],
    },
  ];

  screens.forEach((s) => {
    ui.addScreen(s.screenName, s);
  });
}

function debugButtons(ctx: CanvasRenderingContext2D, debugInstance: Debug) {
  const canvas = ctx.canvas;
  const elements = [
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
      text: "Unknown",
      padding: 10,
      fontSize: "10px",
    }),
    new Button({
      position: {
        x: 650,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Create anim",
      padding: 10,
      fontSize: "10px",
    }),
  ];
  return elements;
}
