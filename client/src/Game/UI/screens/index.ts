import { UI } from "..";
import { ImageKey } from "../../assets/imageAssets/imageAssets";
import { Game } from "../../game";
import { InteractableEntity } from "../../sharedEntities";
import { Debug } from "../../utils";
import { debugButtons, inSoloGameButtons } from "./game";
import { mainMenuButtons } from "./mainMenu";

export type ScreenLayout = {
  screenName: string;
  background: ImageKey | "";
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
      background: "main_bg",
      elements: [
        ...(debugInstance ? debugButtons(ctx, debugInstance!) : []),
        ...inSoloGameButtons(ctx, ui, game),
      ],
    },
    {
      screenName: "main_menu",
      background: "main_bg",
      elements: [...mainMenuButtons(ctx, ui, game)],
    },
  ];

  screens.forEach((s) => {
    ui.addScreen(s.screenName, s);
  });
}
