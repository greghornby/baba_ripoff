import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { Direction } from "../types/Direction.js";
import { makeLevelGridFromString } from "../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


// const levelText = `
// _biy__wis_rip_bip
// _xim__bis_fi[_1i,
// _WWWWWWWWWW
// _W___X____W
// _W________
// _W__B_________R_
// _WF_______W__RRR
// _WWWWWWWWWW___R
// `;
const levelText = `
_biy__ri[
_xim
_____??
____?RR?
_____??
_________
________B
`;

const key = {
    ..._commonKey,
};

export const levelMoveDebug = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key, [
        // ["X", (entity) => entity.setFacing(Direction.down)],
        // ["X", (entity) => entity.setFacing(Direction.right)],
        // ["X", (entity) => entity.setFacing(Direction.left)],
        // ["X", (entity) => entity.setFacing(Direction.up)],

        ["X", (entity) => entity.setFacing(Direction.up)],
        ["X", (entity) => entity.setFacing(Direction.up)],
        ["X", (entity) => entity.setFacing(Direction.left)],
        ["X", (entity) => entity.setFacing(Direction.right)],
        ["X", (entity) => entity.setFacing(Direction.down)],
        ["X", (entity) => entity.setFacing(Direction.down)],
    ])
});