import { Level } from "../main/Level.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


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

export const levelDebug = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});