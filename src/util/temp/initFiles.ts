import { constructs } from "../../objects/constructs.js";
import { words } from "../../objects/words.js";

export async function initFiles () {
    console.log("Loaded", Object.keys(words).length, "words");
    for (const c of Object.values(constructs)) {
        c.parseSpriteSheet();
    }
}