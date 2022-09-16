import * as pixi from "pixi.js";
import { Direction } from "../types/Direction.js";
import { Category } from "./Category.js";
import { Constants } from "./Constants.js";
import type { Word } from "./Word.js";


export class Construct {
    static nextId: number = 0;
    public id: number;
    public texture: pixi.Texture;
    public textures: Record<Direction, pixi.Texture[]> = {
        up: [], down: [], left: [], right: []
    };
    public totalFrames: number = 0;

    public associatedWord: () => Word;
    public category: Category;
    public defaultColor: number;
    constructor(
        public data: ConstructData
    ) {
        this.id = Construct.nextId;
        Construct.nextId++;
        this.texture = data.texture;
        this.associatedWord = data.associatedWord;
        this.category = data.category;
        this.defaultColor = data.color;

        this.parseTexture();
    }


    parseTexture() {
        const tileSize = Constants.TILE_SIZE;
        const animFramesTotal = Constants.ANIMATED_SPRITE_TOTAL_FRAMES;
        const directionFramesTotal = Constants.DIRECTIONAL_SPRITE_TOTAL_FRAMES;
        const textureIsAnimated = this.texture.width === tileSize * animFramesTotal;
        const textureHasFacing = this.texture.height === tileSize * directionFramesTotal;

        this.totalFrames = textureIsAnimated ? Constants.ANIMATED_SPRITE_TOTAL_FRAMES : 1;

        for (let y = 0; y < (textureHasFacing ? directionFramesTotal : 1); y++) {
            for (let x = 0; x < (textureIsAnimated ? animFramesTotal : 1); x++) {
                const rect = new pixi.Rectangle(x * tileSize, y * tileSize, tileSize, tileSize);
                const texture = new pixi.Texture(this.texture.baseTexture, rect);
                if (!textureHasFacing) {
                    for (const direction in this.textures) {
                        this.textures[direction as Direction].push(texture);
                    }
                    continue;
                }
                if (y === Constants.DIRECTION_FRAMES.right) {
                    this.textures.right.push(texture);
                    const leftTexture = new pixi.Texture(this.texture.baseTexture, rect, undefined, undefined, pixi.groupD8.MIRROR_HORIZONTAL);
                    this.textures.left.push(leftTexture);
                } else if (y === Constants.DIRECTION_FRAMES.down) {
                    this.textures.down.push(texture);
                } else if (y === Constants.DIRECTION_FRAMES.up) {
                    this.textures.up.push(texture);
                }
            }
        }
    }

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    category: Category;
    color: number;
    associatedWord: () => Word;
}