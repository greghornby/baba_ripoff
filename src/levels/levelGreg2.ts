import { Level } from "../main/Level.js";
import { constructs } from "../objects/constructs.js";
import { words } from "../objects/words.js";
import { Direction } from "../types/Direction.js";
import { makeLevelGridFromString } from "../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


const levelText = `
wisWWWWWWWWWWWWWWWW
xWWW     W   W   FW
iW?W   p W W W WWWW
mW W     W W   W
_W WWWRWWW WWWWW
_W WW   W     W
_W W          W
_W W          W
2W W          W
iWRW          Wb
1W@W   B r    Wi
WWvW     i    Wy
_ RW     s    WW
fi W           W
_  W           W
`;

const key = {
    ..._commonKey,
    "1": words.sink,
    "2": words.water,
    "@": constructs.water,
    m: words.move
}

export const levelGreg2 = () => new Level({
    width: 19,
    height: 15,
    startingEntities: makeLevelGridFromString(levelText, key, [
        ["X", e => e.setFacing(Direction.down)]
    ])
});