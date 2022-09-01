import { Level } from "../main/Level.js";
import { Rule } from "../main/Rule.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";


const levelText = `
        _
        _WWWWWW_____n
        _W_B__R___ri_p
        _WWWWWW
        _
        ____w
        ___biy
        ____sr
        _____i
        _____p
`;

export const level01 = () => new Level({
    width: 15,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, {
        _: null,
        W: constructs.wall,
        R: constructs.rock,
        B: constructs.baba,
        n: words.not,
        b: words.baba,
        i: words.is,
        y: words.you,
        w: words.wall,
        r: words.rock,
        s: words.stop,
        p: words.push,
    }),
    defaultRules: [
        // new Rule({
        //     subject: Rule.word(words.baba),
        //     verb: words.is,
        //     complement: Rule.word(words.you),
        // }),
        // new Rule({
        //     subject: Rule.word(words.wall),
        //     verb: words.is,
        //     complement:Rule.word(words.stop),
        // }),
        new Rule({
            subject: Rule.word(words.text),
            verb: {word: words.is},
            complement: Rule.word(words.push),
        })
    ]
});