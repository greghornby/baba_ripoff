import { Level } from "../main/Level.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


const levelText = `
_biy____rinf__
WWWWWWWWWWWWWW
W_____R__X_ivW
W_WW_WWiWWi__W
W_____WnWWt__W
W_f_r_WpWWWWWW
W_____WWW__Ww_
W__________Wi_
W__i__F____Ws_
W__p____WWWW__
W___B___Wxiz__
W_______W_____
WWWWWWWWW_____
`;

export const levelGreg1 = () => new Level({
    width: 14,
    height: 13,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});