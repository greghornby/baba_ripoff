import * as pixi from "pixi.js";
import { App } from "../app/App.js";
import { Construct } from "../classes/Construct.js";
import { Entity } from "../classes/Entity.js";
import { Level } from "../classes/Level.js";
import { constants } from "../data/constants.js";
import { constructs } from "../data/constructs.js";
import { LevelController } from "./LevelController.js";

export class EditorController {

    static instance: EditorController | undefined;

    static load(level: Level) {
        console.log("Loading Editor");
        return new EditorController(level);
    }

    public levelController: LevelController;

    public mainContainer: pixi.Container;
    public containers: {
        topToolbar: pixi.Container;
    }

    public currentConstruct: Construct = constructs.baba;
    public hoverTileX: number = 0;
    public hoverTileY: number = 0;

    public constructor(
        public level: Level
    ) {
        (globalThis as any).editor = this;
        EditorController.instance = this;
        this.levelController = LevelController.load(this.level, this);

        this.levelController.paused = true;

        const app = App.get();
        const pixiApp = app.pixiApp;

        this.mainContainer = new pixi.Container();
        this.containers = {
            topToolbar: new pixi.Container
        };

        this.levelController.mainContainer.removeChild(this.levelController.levelContainer);
        this.mainContainer.addChild(this.levelController.levelContainer);

        this.mainContainer.addChild(...Object.values(this.containers));
        pixiApp.stage.removeChild(this.levelController.mainContainer);
        this.levelController.mainContainer = this.mainContainer;
        pixiApp.stage.addChild(this.mainContainer);
        this.setupUI();
        this.setupTileInteractive();

        this.levelController._fitContainerToScreen();
    }


    public setupUI() {
        this.levelController.levelContainer.x = 0;
        this.levelController.levelContainer.y = EditorUI.topToolbar.height;
        {
            const topBG = new pixi.Graphics();
            topBG.beginFill(EditorUI.topToolbar.color);
            topBG.drawRect(0, 0, this.level.pixelWidth, EditorUI.topToolbar.height);
            this.containers.topToolbar.addChild(topBG);
        }
    }


    public setupTileInteractive() {
        const cont = this.levelController.levelContainer;
        cont.hitArea = new pixi.Rectangle(0, 0, this.level.pixelWidth, this.level.pixelHeight);
        cont.interactive = true;


        cont.on("pointermove", (event) => {
            if (event.target !== cont) {
                return;
            }
            // console.log("EVENT", event);
            const globalLoc: pixi.Point = event.data.global;
            const globalCont = cont.getGlobalPosition();
            const localX = (globalLoc.x - globalCont.x) / this.mainContainer.scale.x;
            const localY = (globalLoc.y - globalCont.y) / this.mainContainer.scale.y;

            const tileX = Math.floor(localX / constants.TILE_SIZE);
            const tileY = Math.floor(localY / constants.TILE_SIZE);

            this.hoverTileX = tileX;
            this.hoverTileY = tileY;
        });

        cont.on("pointertap", (event) => {
            if (event.target !== cont) {
                return;
            }
            console.log(`Placing ${this.currentConstruct.name} at x:${this.hoverTileX} y:${this.hoverTileY}`);
            this.levelController.addEntity(new Entity(this.levelController.entityCount++, {
                construct: this.currentConstruct,
                level: this.level,
                controller: this.levelController,
                x: this.hoverTileX,
                y: this.hoverTileY
            }));
        });
    }


    public _getMainContainerDimensions() {
        return {
            width: this.level.pixelWidth,
            height: this.level.pixelHeight + EditorUI.topToolbar.height
        };
    }
}

const EditorUI = {
    topToolbar: {
        height: 100,
        color: 0x114411
    }
};