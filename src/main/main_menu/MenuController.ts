import * as pixi from "pixi.js";
import { App } from "../../app/App.js";
import { fitContainerToView } from "../../util/pixi/fitContainerToView.js";
import { IMenuScreens } from "./IMenuScreens.js";
import { createLevelSelectScreen } from "./screens/createLevelSelectScreen.js";
import { createMainScreen } from "./screens/createMainScreen.js";

export class MenuController {

    static instance: MenuController | undefined;

    static listeners: {
        resize: {}
    };

    width: number = 800;
    height: number = 600;

    public container: pixi.Container;
    public screens: IMenuScreens.ScreenData;
    public currentScreen: IMenuScreens.ScreenName;



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
            main: createMainScreen.call(this),
            levels: createLevelSelectScreen.call(this)
        };

        this.currentScreen = "main";
        for (const screenData of Object.values(this.screens)) {
            this.container.addChild(screenData.containers.parent);
            screenData.containers.parent.x = this.width;
            screenData.containers.parent.y = 0;
        }
        this.screens[this.currentScreen].containers.parent.x = 0;

        this._fitContainerToView();
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

    gotoScreen(screenName: IMenuScreens.ScreenName) {
        const newData = this.screens[screenName];
        newData.containers.parent.x = this.width;
        const oldData = this.screens[this.currentScreen];
        this.currentScreen = screenName;
        if (newData.onGoto) {
            newData.onGoto();
        }
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
}