import * as pixi from "pixi.js";
import { Direction } from "../types/Direction.js";
import { Category } from "./Category.js";
import type { Word } from "./Word.js";


export class Construct {
    static nextId: number = 0;
    public id: number;
    public texture: pixi.Texture;
    public facingTextures?: Record<Direction, pixi.Texture>;
    public associatedWord: () => Word;
    public category: Category;
    public defaultColor: number;
    constructor(
        data: ConstructData
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

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    textureHasDirections?: boolean;
    category: Category;
    color: number;
    associatedWord: () => Word;
}