import { Word } from "../../classes/Word.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    is: new Word("is", {
        texture: textures.words.is_anim,
        behavior: {
            verb: true
        }
    }),

    has: new Word("has", {
        texture: texturePlaceholder,
        behavior: {
            verb: true
        }
    }),

    make: new Word("make", {
        texture: texturePlaceholder,
        behavior: {
            verb: true
        }
    }),
}