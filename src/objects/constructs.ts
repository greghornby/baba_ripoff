import { Construct } from "../main/Construct.js";
import { Word } from "../main/Word.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const constructs = {

    baba: new Construct({
        texture: textures.objects.baba,
        associatedWord: () => Word.findWordFromText("baba"),
        zIndex: 1e6
    }),

    wall: new Construct({
        texture: textures.objects.wall,
        associatedWord: () => Word.findWordFromText("wall"),
        zIndex: 1e7
    }),

    leaf: new Construct({
        texture: texturePlaceholder,
        associatedWord: () => Word.findWordFromText("leaf")
    }),

}