import { constructs } from "../../../data/constructs.js";
import { words } from "../../../data/words.js";
import { Level } from "../../../object_classes/Level.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";

const levelText = `
biyWwisWqi1WkimWlihW
WWWWWWWWWWWWWWWWWWWW
WkipWdisW
WkioWdiSW     K
WWWWWWWWWWWWWWW WWWW
_       W         LL
_  F    D   B    RLL
_       WQQQ      XX
_       WWWWWWWWWWWW
_       Wrimriarip
_ fiv   Wxihxia
`;

const key = {
    "_": null,
    " ": null,
    b: words.baba,
    B: constructs.baba,
    d: words.door,
    D: constructs.door,
    w: words.wall,
    W: constructs.wall,
    r: words.rock,
    R: constructs.rock,
    k: words.key,
    K: constructs.key,
    x: words.skull,
    X: constructs.skull,
    i: words.is,
    y: words.you,
    s: words.stop,
    S: words.shut,
    o: words.open,
    p: words.push,
    f: words.flag,
    F: constructs.flag,
    v: words.win,

    q: words.water,
    Q: constructs.water,
    "1": words.sink,
    l: words.lava,
    L: constructs.lava,
    h: words.hot,
    m: words.melt,
    a: words.float,
};

export const lev_debug02 = new Level("b50d1aa8", "Debug: Removables", {
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key, [
    ])
});