import * as pixi from "pixi.js";
import { App } from "../app/App.js";
import { LevelPack } from "../levels/LevelPack.js";
import { mainPack } from "../levels/mainPack.js";
import { colors } from "../objects/colors.js";
import { destroyOnlyChildren } from "../util/pixi/destroyOnlyChildren.js";
import { fitContainerToView } from "../util/pixi/fitContainerToView.js";
import { LevelController } from "./LevelController.js";

export class MenuController {

    static instance: MenuController | undefined;

    static listeners: {
        resize: {}
    };

    width: number = 800;
    height: number = 600;

    public container: pixi.Container;
    public screens: MenuScreens.ScreenData;
    public currentScreen: MenuScreens.ScreenName;

    public currentLevelPack: LevelPack = mainPack;
    public previousLevelPacks: LevelPack[] = [];

    static load(): MenuController {
        if (!this.listeners) {
            const app = App.get();
            this.listeners = {
                resize: app.events.addListener("resize", () => this.instance ? this.instance._fitContainerToView() : undefined)
            };
        };
        if (!this.instance) {
            this.instance = new MenuController();
        }
        if (this.instance.container.destroyed) {
            this.instance = new MenuController();
        }
        this.instance.display();
        return this.instance;
    }

    private constructor() {
        const app = App.get();
        this.container = new pixi.Container();
        // app.pixiApp.stage.addChild(this.container);
        const bg = new pixi.Sprite(pixi.Texture.WHITE);
        bg.tint = 0x000000;
        const mask = new pixi.Sprite(pixi.Texture.WHITE);
        mask.width = bg.width = this.width;
        mask.height = bg.height = this.height;
        this.container.mask = mask;
        this.container.addChild(bg, mask);
        this.screens = {
            main: {
                containers: {
                    parent: new pixi.Container()
                }
            },
            levels: {
                containers: {
                    parent: new pixi.Container(),
                    levelButtons: new pixi.Container
                }
            }
        };

        this.currentScreen = "main";
        for (const screenData of Object.values(this.screens)) {
            this.container.addChild(screenData.containers.parent);
            screenData.containers.parent.x = this.width;
            screenData.containers.parent.y = 0;
        }
        this.screens[this.currentScreen].containers.parent.x = 0;

        this._fitContainerToView();
        this.populateMainScreen();
        this.populateLevelsScreen();
        this.gotoScreen(this.currentScreen);
    }


    exit(): void {
        this.container.parent.removeChild(this.container);
    }


    display(): void {
        const app = App.get();
        app.pixiApp.stage.addChild(this.container);
        this._fitContainerToView();
    }

    gotoScreen(screenName: MenuScreens.ScreenName) {
        const newData = this.screens[screenName];
        newData.containers.parent.x = this.width;
        const oldData = this.screens[this.currentScreen];
        this.currentScreen = screenName;
        const distance = this.width;
        const overTime = 500;
        let timeRemaining = overTime;
        let lastTime = performance.now();
        const fn = () => {
            const now = performance.now();
            const deltaTime = now - lastTime;
            lastTime = now;
            timeRemaining -= deltaTime;
            if (timeRemaining > 0) {
                const distToMove = (deltaTime/overTime) * distance;
                newData.containers.parent.x -= distToMove;
                if (oldData !== newData) {
                    oldData.containers.parent.x -= distToMove;
                }
                requestAnimationFrame(fn);
            } else {
                if (oldData !== newData) {
                    oldData.containers.parent.x = this.width;
                }
                newData.containers.parent.x = 0;
            }
        }

        if (screenName === "levels") {
            this.previousLevelPacks.length = 0;
            this.populateLevelsFromPack(mainPack);
        }
        fn();
    }

    _fitContainerToView() {
        const app = App.get();
        fitContainerToView(
            this.container,
            app.pixiApp.view.width,
            app.pixiApp.view.height,
            this.width,
            this.height
        );
    }

    populateMainScreen() {
        const mainData = this.screens["main"];
        const parent = mainData.containers.parent;

        const levelsText = new pixi.Text("LEVELS", new pixi.TextStyle({
            fontSize: 30,
            fill: 0xffffff
        }));
        parent.addChild(levelsText);
        levelsText.pivot.set(levelsText.width / 2, 0);
        levelsText.transform.position.set(this.width / 2, 100);
        levelsText.buttonMode = true;
        levelsText.interactive = true;
        levelsText.on("pointertap", () => this.gotoScreen("levels"));
    }

    populateLevelsScreen() {
        this.populateLevelsFromPack(this.currentLevelPack);
        const backToMainMenu = new pixi.Text("Back to Main Menu", {fill: colors.white, fontSize: 40});
        backToMainMenu.pivot.set(backToMainMenu.width/2, backToMainMenu.height/2);
        backToMainMenu.transform.position.set(this.width/2, 50);
        backToMainMenu.buttonMode = true;
        backToMainMenu.interactive = true;
        backToMainMenu.on("pointertap", () => {
            this.gotoScreen("main");
        });

        this.screens.levels.containers.parent.addChild(
            this.screens.levels.containers.levelButtons,
            backToMainMenu
        );
    }

    populateLevelsFromPack(pack: LevelPack) {
        const buttons: {text: string; color: number; action: () => void}[] = [];
        if (this.previousLevelPacks.length) {
            buttons.push({text: "< Back", color: colors.pink, action: () => {
                const lastPack = this.previousLevelPacks.pop()!;
                this.populateLevelsFromPack(lastPack);
            }});
        }
        for (const item of pack.items) {
            if (item instanceof LevelPack) {
                buttons.push({text: item.name, color: colors.gold, action: () => {
                    this.previousLevelPacks.push(pack);
                    this.populateLevelsFromPack(item);
                }})
            } else {
                buttons.push({
                    text: item.name, color: colors.white, action: () => {
                        this.exit();
                        LevelController.load(item);
                    }
                });
            }
        }

        const buttonsCont = this.screens.levels.containers.levelButtons;
        destroyOnlyChildren(buttonsCont);
        for (const [index, button] of buttons.entries()) {
            const text = new pixi.Text(button.text, {
                fontSize: 30,
                fill: button.color
            });
            text.buttonMode = true;
            text.interactive = true;
            text.on("pointerdown", button.action);
            text.pivot.set(text.width/2, text.height/2);
            text.transform.position.set(this.width/2, index*35 + 100);
            buttonsCont.addChild(text);
        }
    }
}

namespace MenuScreens {
    export const screens = ["main", "levels"] as const;
    export type ScreenName = (typeof screens)[number];

    export type ScreenDataConstraint = Record<ScreenName, {
        populated?: true;
        containers: {
            parent: pixi.Container
        }
    }>;
    export type ScreenData = Constraint<ScreenDataConstraint, {
        main: {
            containers: {
                parent: pixi.Container;
            }
        },
        levels: {
            containers: {
                parent: pixi.Container;
                levelButtons: pixi.Container;
            }
        }
    }>;
}

type Constraint<Constraint, Type extends Constraint> = Type & Constraint;