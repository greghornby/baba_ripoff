import * as pixi from "pixi.js";
import type { Word } from "./Word.js";


export class Construct {
    public texture: pixi.Texture;
    public associatedWord: () => Word;
    public zIndex: number = 0;
    constructor(
        data: ConstructData
    ) {
        this.texture = data.texture;
        this.associatedWord = data.associatedWord;
        this.zIndex = data.zIndex ?? this.zIndex;
    }

    toJSON() {
        return {};
    }
}

export interface ConstructData {
    texture: pixi.Texture;
    zIndex?: number;
    associatedWord: () => Word;
}