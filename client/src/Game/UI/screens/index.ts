import { UI } from "..";
import { Game } from "../../Game";
import { InteractableEntity } from "../../sharedEntities";
import { Debug } from "../../utils";
import { debugButtons, inSoloGameButtons } from "./game";
import { mainMenuButtons } from "./mainMenu";

export type ScreenLayout = {
  screenName: string;
  background: string;
  elements: InteractableEntity[];
};

export function initGameScreens(
  ui: UI,
  game: Game,
  ctx: CanvasRenderingContext2D,
  debugInstance?: Debug,
) {
  const screens: ScreenLayout[] = [
    {
      screenName: "solo_game",
      background: "",
      elements: [
        ...(debugInstance ? debugButtons(ctx, debugInstance!) : []),
        ...inSoloGameButtons(ctx, ui, game),
      ],
    },
    {
      screenName: "main_menu",
      background: "",
      elements: [...mainMenuButtons(ctx, ui, game)],
    },
  ];

  screens.forEach((s) => {
    ui.addScreen(s.screenName, s);
  });
}
