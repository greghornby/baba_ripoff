import * as pixi from "pixi.js";
import { textures } from "../data/textures.js";
import { MenuController } from "../menu/MenuController.js";
import { LevelController } from "./LevelController.js";

export class HUDController {

    public width: number;
    public height: number;

    public container: pixi.Container;
    public containers: {
        pause: pixi.Container;
    }

    constructor(public levelController: LevelController) {
        this.width = this.levelController.level.pixelWidth;
        this.height = this.levelController.level.pixelHeight;

        this.container = new pixi.Container();

        this.containers = {
            pause: this.createPauseScreen()
        };

        for (const container of Object.values(this.containers)) {
            this.container.addChild(container);
        }
    }


    public pauseVisibility(visible: boolean): void {
        if (this.containers.pause.visible !== visible) {
            this.containers.pause.visible = visible;
        }
    }


    public createPauseScreen(): pixi.Container {
        const pauseContainer = new pixi.Container();;
        const transparentOverlay = new pixi.Graphics();
        transparentOverlay.beginFill(0x006e8f, 0.5);
        transparentOverlay.drawRect(0, 0, this.width, this.height);
        const menuSprite = new pixi.Sprite(textures.menus.pause_menu);
        menuSprite.anchor.set(0.5, 0.5);
        menuSprite.transform.position.set(this.width / 2, this.height / 2);

        const resumeInteractive = new pixi.Sprite();
        resumeInteractive.hitArea = new pixi.Rectangle(50 - 200, 25 - 125, 300, 50);
        resumeInteractive.hitArea
        resumeInteractive.buttonMode = true;
        resumeInteractive.interactive = true;
        resumeInteractive.on("pointertap", () => this.levelController.togglePause(false));

        const restartInteractive = new pixi.Sprite();
        restartInteractive.hitArea = new pixi.Rectangle(50 - 200, 100 - 125, 300, 50);
        restartInteractive.hitArea
        restartInteractive.buttonMode = true;
        restartInteractive.interactive = true;
        restartInteractive.on("pointertap", () => this.levelController.restart());

        const menuInteractive = new pixi.Sprite();
        menuInteractive.hitArea = new pixi.Rectangle(50 - 200, 175 - 125, 300, 50);
        menuInteractive.hitArea
        menuInteractive.buttonMode = true;
        menuInteractive.interactive = true;
        menuInteractive.on("pointertap", () => {
            this.levelController.exit();
            MenuController.load();
        });

        pauseContainer.addChild(transparentOverlay, menuSprite);
        menuSprite.addChild(resumeInteractive, restartInteractive, menuInteractive);

        pauseContainer.visible = false;

        return pauseContainer;
    }
}