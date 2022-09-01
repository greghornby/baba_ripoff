import { Level } from "../main/Level.js";
import { Rule } from "../main/Rule.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";


// const levelText = `
//         _
//         _WWWWWW_____n
//         _W_B__R___ri_p
//         _WWWWWW
//         _
//         ____w
//         ___biy
//         ____sr
//         _____i
//         _____p
// `;

const levelText = `
_biy__fiv
_WWWWWWWWWW__r
_W________W__i
_W_B______W___n
_W____wis_W__p
_W________W____F
_WWWWWWWWWW__R
_
______rip
`

export const level01 = () => new Level({
    width: 20,
    height: 10,
    startingEntities: makeLevelGridFromString(levelText, {
        _: null,
        W: constructs.wall,
        R: constructs.rock,
        B: constructs.baba,
        F: constructs.flag,
        n: words.not,
        b: words.baba,
        i: words.is,
        y: words.you,
        w: words.wall,
        r: words.rock,
        s: words.stop,
        p: words.push,
        f: words.flag,
        v: words.win,
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