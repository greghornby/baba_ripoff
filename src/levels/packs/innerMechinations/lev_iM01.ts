import { Level } from "../../../main/Level.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


const levelText = `
_biy____rinf__
WWWWWWWWWWWWWW
W_____R____ivW
W_WW_WWWWWi__W
W________Wt__W
W_f_r____WWWWW
W__________Ww_
W__________Wi_
W__i__F____Ws_
W__p____WWWW__
W___B___W_____
W_______W_____
WWWWWWWWW_____
`;

export const lev_iM01 = new Level("4f7ba2bb", "Where Rock?", {
    width: 14,
    height: 13,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});