import { Level } from "./Level.js";
import * as pixi from "pixi.js";
import { Entity } from "./Entity.js";
import { App } from "./App.js";
import { AppEvents } from "./AppEvent.js";

export class LevelController {

    public ticker: pixi.Ticker;
    public container: pixi.Container;
    public resizeListener: EventListener;
    public grid: pixi.Graphics;

    constructor(
        public level: Level
    ) {

        const app = App.get();
        const pixiApp = app.pixiApp;

        // remove all children and render empty screen
        for (const child of pixiApp.stage.children) {
            pixiApp.stage.removeChild(child)
        }
        pixiApp.render();

        //create new ticker
        this.ticker = new pixi.Ticker();

        //create container and populate with sprites
        this.container = new pixi.Container();
        pixiApp.stage.addChild(this.container);
        for (let y = 0; y < this.level.sprites.length; y++) {
            const row = this.level.sprites[y];
            for (let x = 0; x < row.length; x++) {
                const construct = row[x];
                if (construct) {
                    const obj = new Entity({
                        level: this.level,
                        controller: this,
                        construct: construct,
                        x: x,
                        y: y,
                    });
                }
            }
        }

        //setup grid graphics object
        this.grid = new pixi.Graphics();
        this.grid.zIndex = Infinity;
        this.container.addChild(this.grid);

        //setup resize listener
        this.fitContainerToScreen();
        this.resizeListener = () => this.fitContainerToScreen();
        globalThis.addEventListener(AppEvents.resize, this.resizeListener);

        //add the main `tick` function and start the ticker again
        this.ticker.add(() => this.tick());
        this.ticker.start();
    }


    public exit(): void {
        globalThis.removeEventListener(AppEvents.resize, this.resizeListener);
    }


    private fitContainerToScreen(): void {
        const app = App.get();
        const view = app.pixiApp.view;
        const level = this.level;

        this.container.pivot.set(level.pixelWidth/2, level.pixelHeight/2);
        this.container.transform.position.set(view.width/2, view.height/2);

        const xMult = view.width / level.pixelWidth;
        const yMult = view.height / level.pixelHeight;

        const scaleMultiplier = level.pixelHeight * xMult > view.height ? yMult : xMult;

        this.container.scale = {x: scaleMultiplier, y: scaleMultiplier};
    }


    private drawGrid() {
        this.grid.clear();
        this.grid.lineStyle(2, 0x999999, 0.8);
        for (let x = 0; x <= this.level.width; x++) {
            this.grid.moveTo(x * this.level.TILE_SIZE, 0);
            this.grid.lineTo(x * this.level.TILE_SIZE, this.level.pixelHeight);
        }
        for (let y = 0; y <= this.level.height; y++) {
            this.grid.moveTo(0, y * this.level.TILE_SIZE);
            this.grid.lineTo(this.level.pixelWidth, y * this.level.TILE_SIZE);
        }
    }


    tick(): void {
        console.log("tick");
        this.drawGrid();
    }
}