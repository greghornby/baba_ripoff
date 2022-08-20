import { Construct } from "./Construct.js";
import { Entity } from "./Entity.js";
import { Rule } from "./Rule.js";
import { LevelController } from "./LevelController.js";

export class Level {

    public controller: LevelController | undefined;

    public TILE_SIZE: number = 50;

    public width: number;
    public pixelWidth: number;
    public height: number;
    public pixelHeight: number;
    public sprites: (Construct | null)[][];

    public entities: Set<Entity> = new Set();

    constructor(public initData: InitLevelData) {
        this.width = initData.width;
        this.pixelWidth = this.width * this.TILE_SIZE;
        this.height = initData.height;
        this.pixelHeight = this.height * this.TILE_SIZE;
        this.sprites = initData.sprites;
    }


    public load() {
        this.controller = new LevelController(this);
    }


    public exit() {
        this.controller?.exit();
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
    defaultRules?: Rule[];
}