import { Construct } from "./Construct.js";
import { getApp } from "../util/getApp.js";
import * as pixi from "pixi.js";
import { Entity } from "./Entity.js";
import { NonAbstract } from "../util/utilTypes.js";

export class Level {

    public TILE_SIZE: number = 50;

    // Init Data
    public width: number;
    public height: number;
    public sprites: (Construct | null)[][];

    public container!: pixi.Container;

    public entities: Set<Entity> = new Set();

    constructor(public initData: InitLevelData) {
        this.width = initData.width;
        this.height = initData.height;
        this.sprites = initData.sprites;
    }


    public tick() {

    }


    public load() {
        const app = getApp();
        for (const child of app.stage.children) {
            app.stage.removeChild(child)
        }
        this.container = new pixi.Container();
        Object.assign<pixi.Container, Partial<pixi.Container>>(this.container, {
            width: app.screen.width,
            height: app.screen.height,
            x: 0,
            y: 0
        });
        app.stage.addChild(this.container);
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