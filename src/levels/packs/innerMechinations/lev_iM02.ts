import { Level } from "../../../main/Level.js";
import { constructs } from "../../../objects/constructs.js";
import { textures } from "../../../objects/textures.js";
import { words } from "../../../objects/words.js";
import { Direction } from "../../../types/Direction.js";
import { isMobile } from "../../../util/data/isMobile.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


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

export const lev_iM02 = new Level("72ed0239", "Spooky", {
    debugPromptCopyInteractions: true,
    width: 19,
    height: 15,
    startingEntities: makeLevelGridFromString(levelText, key, [
        ["X", e => e.setFacing(Direction.down)]
    ]),
    background: [{
        y: 7,
        x: 16,
        texture: isMobile() ? textures.background.wait_hint_mobile : textures.background.wait_hint_desktop
    }]
});