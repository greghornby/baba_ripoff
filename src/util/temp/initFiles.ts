import { constructs } from "../../objects/constructs.js";
import { words } from "../../objects/words.js";

export async function initFiles () {
    await setTimeout(res => res, 0);
    console.log("Loaded", Object.keys(words).length, "words");
    for (const c of Object.values(constructs)) {
        await c.parseSpriteSheet();
    }
    for (const c of Object.values(words)) {
        await c.parseSpriteSheet();
    }
}