import * as pixi from "pixi.js";
import { constants } from "../data/constants.js";
import { Direction } from "../types/Direction.js";
import { directionToXY } from "../util/movement/directionToXY.js";
import { Category } from "./Category.js";
import type { Word } from "./Word.js";


export class Construct {

    static constructs: Construct[] = [];

    static findConstructFromName(name: string): Construct {
        const result = this.constructs.find(c => c.name === name);
        if (!result) {
            throw new Error(`Could not find Construct from name "${name}"`);
        }
        return result;
    }

    static nextId: number = 0;
    public id: number;
    public texture: pixi.Texture;
    public textures: Record<Direction, pixi.Texture[]> = {
        up: [], down: [], left: [], right: []
    };
    public totalFrames: number = 0;

    // public associatedWord: () => Word;
    public word!: Word;
    public category: Category;
    public defaultColor: number;
    constructor(
        public name: string,
        public data: ConstructData
    ) {
        Construct.constructs.push(this);
        this.id = Construct.nextId;
        Construct.nextId++;
        this.texture = data.texture;
        // this.associatedWord = data.findWord;
        this.category = data.category;
        this.defaultColor = data.color;

        this.parseTexture();
    }


    parseTexture() {
        const tileSize = constants.TILE_SIZE;
        const animFramesTotal = constants.TEXTURE_ANIMATED_TOTAL_FRAMES;
        const textureIsAnimated = this.texture.width === tileSize * animFramesTotal;

        const textureHasDirections = this.texture.height % tileSize === 0 && this.texture.height / tileSize > 1;
        const textureGenerateUp = textureHasDirections && this.texture.height / tileSize < (constants.TEXTURE_DIRECTION_ROW.up + 1)

        this.totalFrames = textureIsAnimated ? constants.TEXTURE_ANIMATED_TOTAL_FRAMES : 1;

        const yIterations = (textureHasDirections ? textureGenerateUp ? constants.TEXTURE_DIRECTION_ROW.down+1 : constants.TEXTURE_DIRECTION_ROW.up+1  : 1);
        for (let y = 0; y < yIterations; y++) {
            for (let x = 0; x < (textureIsAnimated ? animFramesTotal : 1); x++) {
                const rect = new pixi.Rectangle(x * tileSize, y * tileSize, tileSize, tileSize);
                const texture = new pixi.Texture(this.texture.baseTexture, rect);
                if (!textureHasDirections) {
                    if (!this.data.rotableTexture) {
                        for (const direction in this.textures) {
                            this.textures[direction as Direction].push(texture);
                        }
                    } else {
                        for (const direction in this.textures) {
                            const xy = [...directionToXY(direction as Direction)] as [number, number];
                            xy[1] *= -1;
                            let rotation = pixi.groupD8.byDirection(...xy);
                            const rotatedTexture = new pixi.Texture(this.texture.baseTexture, rect, undefined, undefined, rotation);
                            this.textures[direction as Direction].push(rotatedTexture);
                        }
                    }
                    continue;
                }
                if (y === constants.TEXTURE_DIRECTION_ROW.right) {
                    this.textures.right.push(texture);
                    const leftTexture = new pixi.Texture(this.texture.baseTexture, rect, undefined, undefined, pixi.groupD8.MIRROR_HORIZONTAL);
                    this.textures.left.push(leftTexture);
                } else if (y === constants.TEXTURE_DIRECTION_ROW.down) {
                    this.textures.down.push(texture);
                    if (textureGenerateUp) {
                        const upTexture = new pixi.Texture(this.texture.baseTexture, rect, undefined, undefined, pixi.groupD8.MIRROR_VERTICAL);
                        this.textures.up.push(upTexture);
                    }
                } else if (y === constants.TEXTURE_DIRECTION_ROW.up) {
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
    rotableTexture?: boolean;
    category: Category;
    color: number;
    findWord?: () => Word;
}