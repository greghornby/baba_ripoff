import * as pixijs from "pixi.js";
import _missing from "../images/missing.png"
import objects_stone from "../images/objects/stone.png"
import objects_wall from "../images/objects/wall.png"

export const textures = {
    "missing": pixijs.Texture.from(_missing),
    "objects": {
        "stone": pixijs.Texture.from(objects_stone),
        "wall": pixijs.Texture.from(objects_wall)
    }
}