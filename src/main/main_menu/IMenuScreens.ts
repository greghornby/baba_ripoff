import * as pixi from "pixi.js";
import { LevelPack } from "../../levels/LevelPack.js";

export namespace IMenuScreens {
    export const screens = ["main", "levels"] as const;
    export type ScreenName = (typeof screens)[number];

    export type ScreenDataConstraint = Record<ScreenName, {
        name: string;
        onGoto?: () => void;
        state?: unknown;
        containers: {
            parent: pixi.Container
        }
    }>;
    export type ScreenData = Constraint<ScreenDataConstraint, {
        main: {
            name: "main";
            containers: {
                parent: pixi.Container;
            }
        },
        levels: {
            name: "levels";
            state: {
                currentLevelPack: LevelPack;
                previousLevelPacks: LevelPack[];
            };
            containers: {
                parent: pixi.Container;
                levelButtons: pixi.Container;
            }
        }
    }>;
}

type Constraint<Constraint, Type extends Constraint> = Type & Constraint;