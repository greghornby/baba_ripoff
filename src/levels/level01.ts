import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";

const E = null;
const [W, B] = [constructs.wall, constructs.baba];

const [b,i,y] = [words.baba, words.is, words.you];
const [w,s] = [words.wall, words.stop];

export const level01 = new Level({
    width: 10,
    height: 10,
    sprites: [
        [E,E,W,w,i,s,W,E,E,E],
        [E,W,W,W,W,W,W,E,E,E],
        [E,W,E,B,E,E,E,E,E,E],
        [E,W,W,W,W,W,W,E,E,E],
        [E,E,E,E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E,E,E,E],
        [E,E,E,b,i,y,E,E,E,E],
        [E,E,E,E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E,E,E,E],
    ]
});