import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";

const E = null;
const W = constructs.wall;

export const level01 = new Level({
    width: 10,
    height: 10,
    sprites: [
        [E,E,E,E,E,E,W,E,E,E],
        [E,W,W,W,W,W,W,E,E,E],
        [E,W,E,E,E,E,E,E,E,E],
        [E,W,W,W,W,W,W,E,E,E],
        [E,E,E,E,E,E,W,E,E,E],
    ]
});