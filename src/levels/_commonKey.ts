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
    "!": constructs.belt,
    a: words.and,
    n: words.not,
    b: words.baba,
    i: words.is,
    y: words.you,
    w: words.wall,
    r: words.rock,
    s: words.stop,
    p: words.push,
    "[": words.pull,
    f: words.flag,
    v: words.win,
    x: words.skull,
    z: words.defeat,
    t: words.text,
    m: words.move,
    ",": words.shift,
    "1": words.belt
};