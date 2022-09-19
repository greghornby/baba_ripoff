import * as pixi from "pixi.js";
import { constants } from "../../data/constants.js";
import { constructs } from "../../data/constructs.js";
import { textures } from "../../data/textures.js";
import { words } from "../../data/words.js";
import { mainPack } from "../../levels/mainPack.js";
import { mapTextureToSheet } from "../pixi/mapTextureToSheet.js";

export async function initFiles () {
    await setTimeout(res => res, 0);
    console.log("Loaded", Object.keys(words).length, "words and", Object.keys(constructs).length, "constructs");
    console.log("Loaded Level Pack", mainPack.name);
    for (const t of Object.values(textures.animations)) {
        const data: pixi.ISpritesheetData = {
            frames: {},
            animations: {main: []},
            meta: {scale: "1"}
        };
        const count = t.baseTexture.width / constants.TILE_SIZE;
        for (let i = 0; i < count; i++) {
            const _i = ""+i;
            data.frames[_i] = {
                frame: {
                    x: i*constants.TILE_SIZE,
                    y: 0,
                    w: constants.TILE_SIZE,
                    h: constants.TILE_SIZE
                }
            };
            data.animations!.main.push(_i);
        }
        const sheet = new pixi.Spritesheet(t, data);
        await sheet.parse();
        mapTextureToSheet.set(t, sheet);
    }
}