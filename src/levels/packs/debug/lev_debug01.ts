import { Level } from "../../../classes/Level.js";
import { constructs } from "../../../data/constructs.js";
import { words } from "../../../data/words.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


const levelText = `
_biy__fiv__(i)
___xiz_X
_WWWWWWWWWW___n
_W________W___r
_W_B______W___i
_W____wis_W__r__tp
_W________W____
_WWWWWWWWWW__R
_F__a999
___fi[__rip(ip
`;

const key = {
    ..._commonKey,
    "[": words.pull,
    "9": constructs.belt,
    "(": words.belt,
    ")": words.shift
}

export const lev_debug01 = new Level("8b7f2b23", "Debug: Playroom", {
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key)
});