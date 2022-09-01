import { Level } from "../main/Level.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


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
`;

export const levelDebug = () => new Level({
    width: 20,
    height: 10,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});