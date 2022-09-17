import * as pixi from "pixi.js";
import { Constants } from "./Constants.js";
import type { Construct } from "./Construct.js";
import type { Entity } from "./Entity.js";

export class Level {

    public TILE_SIZE: number = Constants.TILE_SIZE;

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
}


export interface InitLevelData {
    width: number;
    height: number;
    background?: {
        texture: pixi.Texture;
        x: number;
        y: number;
    }[];
    startingEntities: () => {
        grid: LevelGrid<Construct>;
        entitySetters: {x: number; y: number, fn: (entity: Entity) => void}[];
    };
    debugPromptCopyInteractions?: boolean;
}

export type Cell<T> = T[];
export type LevelRow<T> = Cell<T>[];
export type LevelGrid<T> = LevelRow<T>[];