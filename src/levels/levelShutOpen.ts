import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { Direction } from "../types/Direction.js";
import { makeLevelGridFromString } from "../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";

const levelText = `
WbiyWwisW
WWWWWWWWW
WkipWdisW      K
WkioWdiSW
WWWWWWWWWWWWWWW WWWW
_       W
_  F    D   B
_       W
_       WWWWWWWWWWWW
_
_ fiv
`;

const key = {
    "_": null,
    " ": null,
    b: words.baba,
    B: constructs.baba,
    d: words.door,
    w: words.wall,
    W: constructs.wall,
    D: constructs.door,
    k: words.key,
    K: constructs.key,
    i: words.is,
    y: words.you,
    s: words.stop,
    S: words.shut,
    o: words.open,
    p: words.push,
    f: words.flag,
    F: constructs.flag,
    v: words.win,
};

export const levelShutOpen = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key, [
        // ["X", (entity) => entity.setFacing(Direction.down)],
        // ["X", (entity) => entity.setFacing(Direction.right)],
        // ["X", (entity) => entity.setFacing(Direction.left)],
        // ["X", (entity) => entity.setFacing(Direction.up)],

        ["X", (entity) => entity.setFacing(Direction.right)],
        ["X", (entity) => entity.setFacing(Direction.left)],
    ])
});