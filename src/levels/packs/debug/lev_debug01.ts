import { Level } from "../../../classes/Level.js";
import { words } from "../../../data/words.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


const levelText = `
_biy__fiv
___xiz_X
_WWWWWWWWWW___n
_W________W___r
_W_B______W___i
_W____wis_W__r__tp
_W________W____
_WWWWWWWWWW__R
_F__a
___fi[__rip
`;

const key = {
    ..._commonKey,
    "[": words.pull
}

export const lev_debug01 = new Level("8b7f2b23", "Debug: Playroom", {
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key)
});