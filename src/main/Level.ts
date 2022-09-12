import { Construct } from "./Construct.js";
import type { Entity } from "./Entity.js";
import { LevelController } from "./LevelController.js";

export class Level {

    public controller: LevelController | undefined;

    public TILE_SIZE: number = 50;

    public width: number;
    public pixelWidth: number;
    public height: number;
    public pixelHeight: number;

    constructor(public initData: InitLevelData) {
        this.width = initData.width;
        this.pixelWidth = this.width * this.TILE_SIZE;
        this.height = initData.height;
        this.pixelHeight = this.height * this.TILE_SIZE;
    }


    public load() {
        this.controller = new LevelController(this);
    }


    public exit() {
        this.controller?.exit();
    }
}


export interface InitLevelData {
    width: number;
    height: number;
    startingEntities: () => {
        grid: LevelGrid<Construct>;
        entitySetters: {x: number; y: number, fn: (entity: Entity) => void}[];
    };
}

export type Cell<T> = T[];
export type LevelRow<T> = Cell<T>[];
export type LevelGrid<T> = LevelRow<T>[];