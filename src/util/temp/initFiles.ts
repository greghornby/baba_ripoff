import { constructs } from "../../objects/constructs.js";
import { textures } from "../../objects/textures.js";
import { words } from "../../objects/words.js";
import * as pixi from "pixi.js";
import { Constants } from "../../main/Constants.js";
import { mapTextureToSheet } from "../pixi/mapTextureToSheet.js";

export async function initFiles () {
    await setTimeout(res => res, 0);
    console.log("Loaded", Object.keys(words).length, "words");
    for (const c of Object.values(constructs)) {
        await c.parseSpriteSheet();
    }
    for (const c of Object.values(words)) {
        await c.parseSpriteSheet();
    }
    for (const t of Object.values(textures.animations)) {
        const data: pixi.ISpritesheetData = {
            frames: {},
            animations: {main: []},
            meta: {scale: "1"}
        };
        const count = t.baseTexture.width / Constants.TILE_SIZE;
        for (let i = 0; i < count; i++) {
            const _i = ""+i;
            data.frames[_i] = {
                frame: {
                    x: i*Constants.TILE_SIZE,
                    y: 0,
                    w: Constants.TILE_SIZE,
                    h: Constants.TILE_SIZE
                }
            };
            data.animations!.main.push(_i);
        }
        const sheet = new pixi.Spritesheet(t, data);
        await sheet.parse();
        mapTextureToSheet.set(t, sheet);
    }
}