import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { Direction } from "../types/Direction.js";
import { makeLevelGridFromString } from "../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";

const levelText = `
_biy_wis_wiS
_rip_rio_xis
_
__B__R__W
`;

const key = {
    "_": null,
    b: words.baba,
    B: constructs.baba,
    w: words.wall,
    // W: [constructs.wall, constructs.skull],
    W: constructs.wall,
    r: words.rock,
    R: constructs.rock,
    x: words.skull,
    X: constructs.skull,
    i: words.is,
    y: words.you,
    s: words.stop,
    S: words.shut,
    o: words.open,
    p: words.push
};

export const levelShutOpen = () => new Level({
    width: 20,
    height: 11,
    startingEntities: makeLevelGridFromString(levelText, key, [
        // ["X", (entity) => entity.setFacing(Direction.down)],
        // ["X", (entity) => entity.setFacing(Direction.right)],
        // ["X", (entity) => entity.setFacing(Direction.left)],
        // ["X", (entity) => entity.setFacing(Direction.up)],

        ["X", (entity) => entity.setFacing(Direction.right)],
        ["X", (entity) => entity.setFacing(Direction.left)],
    ])
});