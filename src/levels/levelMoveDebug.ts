import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { Direction } from "../types/Direction.js";
import { makeLevelGridFromString } from "../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


const levelText = `
_biy__wis_rip_bip
_xim__bis_fi[_1i,
_WWWWWWWWWW
_W___?____W
_W_?_______
_W__-R_________R_
_WF_______W__RRR
_WWWWWWWWWW___R
`;

const key = {
    ..._commonKey,
    "+": [constructs.baba, constructs.skull],
    "-": [constructs.baba, constructs.flag]
};

export const levelMoveDebug = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key, [
        ["X", (entity) => entity.setFacing(Direction.right)],
        ["+", (entity => entity.setFacing(Direction.right))],
    ])
});