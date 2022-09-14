import * as pixi from "pixi.js";
import { Direction } from "../types/Direction.js";
import { Category } from "./Category.js";
import { Constants } from "./Constants.js";
import { Level } from "./Level.js";
import type { Word } from "./Word.js";


export class Construct {
    static nextId: number = 0;
    public id: number;
    public texture: pixi.Texture;
    public facingTextures?: Record<Direction, pixi.Texture>;
    public spriteSheet?: pixi.Spritesheet;
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

        if (data.textureHasDirections) {
            this.facingTextures = {
                right: new pixi.Texture(
                    data.texture.baseTexture,
                    new pixi.Rectangle(0, 0, 50, 50)
                ),
                left: new pixi.Texture(
                    data.texture.baseTexture,
                    new pixi.Rectangle(0, 0, 50, 50),
                    undefined,
                    undefined,
                    pixi.groupD8.MIRROR_HORIZONTAL
                ),
                down: new pixi.Texture(
                    data.texture.baseTexture,
                    new pixi.Rectangle(50, 0, 50, 50)
                ),
                up: new pixi.Texture(
                    data.texture.baseTexture,
                    new pixi.Rectangle(100, 0, 50, 50)
                )
            }
        }
    }

    async parseSpriteSheet() {
        if (!this.data.animatedTexture) {
            return;
        }
        const sheetData: pixi.ISpritesheetData = {
            frames: {},
            animations: {jiggle: []},
            meta: {
                scale: "1"
            }
        };
        const count = this.texture.baseTexture.width / Constants.TILE_SIZE;
        for (let i = 0; i < count; i++) {
            const _i = ""+i;
            sheetData.frames[_i] = {
                frame: {
                    x: i * Constants.TILE_SIZE,
                    y: 0,
                    w: Constants.TILE_SIZE,
                    h: Constants.TILE_SIZE
                }
            };
            sheetData.animations!.jiggle.push(_i);
        }
        const sheet = new pixi.Spritesheet(this.texture, sheetData);
        await sheet.parse();
        this.spriteSheet = sheet;
    }

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    textureHasDirections?: boolean;
    animatedTexture?: boolean;
    category: Category;
    color: number;
    associatedWord: () => Word;
}