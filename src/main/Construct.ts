import * as pixi from "pixi.js";
import { Category } from "./Category.js";
import type { Word } from "./Word.js";


export class Construct {
    public texture: pixi.Texture;
    public associatedWord: () => Word;
    public category: Category;
    constructor(
        data: ConstructData
    ) {
        this.texture = data.texture;
        this.associatedWord = data.associatedWord;
        this.category = data.category;
    }

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    category: Category;
    associatedWord: () => Word;
}