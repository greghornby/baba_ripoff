import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Entity } from "./Entity.js";
import { App } from "./App.js";
import { AppEvents } from "./AppEvent.js";

export class Level {

    public TILE_SIZE: number = 50;

    public width: number;
    public pixelWidth: number;
    public height: number;
    public pixelHeight: number;
    public sprites: (Construct | null)[][];

    public container!: pixi.Container;
    public resizeListener!: EventListener;


    public entities: Set<Entity> = new Set();

    constructor(public initData: InitLevelData) {
        this.width = initData.width;
        this.pixelWidth = this.width * this.TILE_SIZE;
        this.height = initData.height;
        this.pixelHeight = this.height * this.TILE_SIZE;
        this.sprites = initData.sprites;
    }


    quitLevel() {
        globalThis.removeEventListener(AppEvents.resize, this.resizeListener);
    }


    public tick() {

    }


    public load() {
        const app = App.get();
        const pixiApp = app.pixiApp;
        for (const child of pixiApp.stage.children) {
            pixiApp.stage.removeChild(child)
        }
        this.container = new pixi.Container();
        pixiApp.stage.addChild(this.container);
        for (let y = 0; y < this.sprites.length; y++) {
            const row = this.sprites[y];
            for (let x = 0; x < row.length; x++) {
                const construct = row[x];
                if (construct) {
                    const obj = new Entity({
                        level: this,
                        construct: construct,
                        x: x,
                        y: y,
                    });
                }
            }
        }

        const border = new pixi.Graphics();
        border.zIndex = Infinity;
        this.container.addChild(border);
        pixiApp.ticker.add(() => {
            border.clear();
            border.lineStyle(2, 0x999999, 0.8);
            for (let x = 0; x <= this.width; x++) {
                border.moveTo(x * this.TILE_SIZE, 0);
                border.lineTo(x * this.TILE_SIZE, this.pixelHeight);
            }
            for (let y = 0; y <= this.height; y++) {
                border.moveTo(0, y * this.TILE_SIZE);
                border.lineTo(this.pixelWidth, y * this.TILE_SIZE);
            }
        });

        this.fitContainerToScreen();
        this.resizeListener = () => this.fitContainerToScreen();
        globalThis.addEventListener(AppEvents.resize, this.resizeListener);
    }


    fitContainerToScreen(): void {
        const app = App.get();
        const view = app.pixiApp.view;

        this.container.pivot.set(this.pixelWidth/2, this.pixelHeight/2);
        Object.assign<pixi.Container, Partial<pixi.Container>>(this.container, {
            x: view.width / 2,
            y: view.height / 2,
        });

        const xMult = view.width / this.pixelWidth;
        const yMult = view.height / this.pixelHeight;

        const scaleMultiplier = this.pixelHeight * xMult > view.height ? yMult : xMult;

        this.container.scale = {x: scaleMultiplier, y: scaleMultiplier};
    }


    getAllConstructsInLevel(): Construct[] {
        return [...new Set([...this.entities].map(e => e.construct))];
    }


    getEntitiesOfConstruct(construct: Construct): Entity[] {
        return [...this.entities].filter(e => e.construct === construct);
    }


    getAllConstructsWithEntitiesInLevel(): {construct: Construct; entities: Entity[]}[] {
        const map: Map<Construct, Entity[]> = new Map();
        for (const entity of this.entities) {
            let construct = entity.construct;
            let entityArray = map.get(construct);
            if (!entityArray) {
                entityArray = [];
                map.set(construct, entityArray);
            }
            entityArray.push(entity);
        }
        return [...map.entries()].map(entry => ({construct: entry[0], entities: entry[1]}));
    }
}


export interface InitLevelData {
    width: number;
    height: number;
    sprites: (Construct | null)[][];
}