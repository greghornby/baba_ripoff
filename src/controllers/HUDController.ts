import * as pixi from "pixi.js";
import { constants } from "../data/constants.js";
import { textures } from "../data/textures.js";
import { MenuController } from "../menu/MenuController.js";
import { isMobile } from "../util/data/isMobile.js";
import { pivotToCenter } from "../util/pixi/pivotToCenter.js";
import { LevelController } from "./LevelController.js";

export class HUDController {

    public width: number;
    public height: number;

    showingDeathScreen: boolean = false;

    public container: pixi.Container;
    public containers: {
        pause: pixi.Container;
        death: pixi.Container;
    }

    constructor(public levelController: LevelController) {
        this.width = this.levelController.level.pixelWidth;
        this.height = this.levelController.level.pixelHeight;

        this.container = new pixi.Container();

        this.containers = {
            pause: this.createPauseScreen(),
            death: this.createDeathScreen()
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


    displayDeathScreen() {
        if (this.showingDeathScreen) {
            return;
        }
        this.showingDeathScreen = true;
        const gen = function* (this: HUDController) {
            this.containers.death.transform.position.set(0, -constants.TILE_SIZE);
            const MOVE_AMOUNT = constants.TILE_SIZE;
            const DURATION = 200;

            let moveRemaining = MOVE_AMOUNT;
            while (moveRemaining > 0) {
                yield;

                const deltaTime = this.levelController.deltaTime;
                const deltaMove = (deltaTime / DURATION) * MOVE_AMOUNT;
                moveRemaining -= deltaMove;

                if (moveRemaining <= 0) {
                    this.containers.death.y = 0;
                } else {
                    this.containers.death.y += deltaMove;
                }
            }
        };

        const it = gen.call(this);
        this.levelController.coroutines.add(it);
    }


    hideDeathScreen() {
        if (!this.showingDeathScreen) {
            return;
        }
        this.showingDeathScreen = false;
        const gen = function* (this: HUDController) {
            this.containers.death.transform.position.set(0, 0);
            const MOVE_AMOUNT = constants.TILE_SIZE;
            const DURATION = 200;

            let moveRemaining = MOVE_AMOUNT;
            while (moveRemaining > 0) {
                yield;

                const deltaTime = this.levelController.deltaTime;
                const deltaMove = (deltaTime / DURATION) * MOVE_AMOUNT;
                moveRemaining -= deltaMove;

                if (moveRemaining <= 0) {
                    this.containers.death.y = -constants.TILE_SIZE;
                } else {
                    this.containers.death.y -= deltaMove;
                }
            }
        };

        const it = gen.call(this);
        this.levelController.coroutines.add(it);
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

    public createDeathScreen(): pixi.Container {
        const deathContainer = new pixi.Container();
        deathContainer.y = -constants.TILE_SIZE;

        const bg = new pixi.Graphics();
        deathContainer.addChild(bg);
        bg.beginFill(0x000000, 0.5);
        bg.drawRect(0, 0, this.width, constants.TILE_SIZE);
        bg.endFill();

        const undoText = new pixi.Text(isMobile() ? "[Double Tap] Undo" : "[z] Undo", {fontSize: 30, fill: 0xffffff});
        deathContainer.addChild(undoText);
        pivotToCenter(undoText);
        undoText.transform.position.set(undoText.width/2 + constants.TILE_SIZE, constants.TILE_SIZE / 2);

        const restartText = new pixi.Text(isMobile() ? "[Long Press] Pause"  :"[t] Restart", {fontSize: 30, fill: 0xffffff});
        deathContainer.addChild(restartText);
        pivotToCenter(restartText);
        restartText.transform.position.set(this.width - restartText.width/2 - constants.TILE_SIZE, constants.TILE_SIZE / 2);

        return deathContainer;
    }
}