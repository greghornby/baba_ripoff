import * as pixi from "pixi.js";
import { constants } from "../data/constants.js";
import type { Construct } from "./Construct.js";
import type { Entity } from "./Entity.js";

export class Level {

    static store: Map<string, Level> = new Map();

    public TILE_SIZE: number = constants.TILE_SIZE;

    public width: number;
    public pixelWidth: number;
    public height: number;
    public pixelHeight: number;

    constructor(public id: string, public name: string, public initData: InitLevelData) {
        if (Level.store.has(id)) {
            throw new Error("Duplicate Level id: " + id);
        }
        Level.store.set(this.id, this);
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