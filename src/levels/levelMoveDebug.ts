import { Level } from "../main/Level.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


const levelText = `
_biy__wis_rip
_xim__bis_fiv
_WWWWWWWWWW
_W________W
_W_B__R___W
_W____X___W
_WF_______W
_WWWWWWWWWW
`;

export const levelMoveDebug = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});