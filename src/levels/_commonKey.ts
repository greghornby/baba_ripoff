import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";

export const _commonKey = {
    _: null,
    " ": null,
    W: constructs.wall,
    R: constructs.rock,
    B: constructs.baba,
    F: constructs.flag,
    X: constructs.skull,
    w: words.wall,
    r: words.rock,
    b: words.baba,
    f: words.flag,
    x: words.skull,
    t: words.text,

    a: words.and,
    n: words.not,
    i: words.is,
    y: words.you,

    s: words.stop,
    p: words.push,

    v: words.win,
    z: words.defeat,
};