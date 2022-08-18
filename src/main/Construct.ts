import * as pixi from "pixi.js";
import type { Word } from "./Word.js";


export class Construct {
    public texture: pixi.Texture;
    public associatedWord: () => Word;
    constructor(
        data: ConstructData
    ) {
        this.texture = data.texture;
        this.associatedWord = data.associatedWord;
    }

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    associatedWord: () => Word;
}