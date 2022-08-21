import { Level } from "../main/Level.js";
import { Rule } from "../main/Rule.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";

export const level01 = () => new Level({
    width: 10,
    height: 10,
    startingEntities: makeLevelGridFromString(`
        __WwisW
        _WWWWWW
        _W_B
        _WWWWWW
        _
        _
        ___biy
    `, {
        _: null,
        W: constructs.wall,
        B: constructs.baba,
        b: words.baba,
        i: words.is,
        y: words.you,
        w: words.wall,
        s: words.stop
    }),
    defaultRules: [
        new Rule({
            subject: Rule.word(words.baba),
            verb: words.is,
            complement: Rule.word(words.you),
        }),
        new Rule({
            subject: Rule.word(words.wall),
            verb: words.is,
            complement:Rule.word(words.stop),
        }),
        new Rule({
            subject: Rule.word(words.text),
            verb: words.is,
            complement: Rule.word(words.push),
        })
    ]
});