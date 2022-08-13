import * as pixi from "pixi.js";

export class Construct {
    public imageBase64: string;
    public pixiTexture: pixi.Texture;
    constructor(
        data: ConstructData
    ) {
        this.imageBase64 = data.image;
        this.pixiTexture = pixi.Texture.from(data.image);
    }
}

export interface ConstructData {
    image: string;
}