import { Level } from "../../../main/Level.js";
import { textures } from "../../../objects/textures.js";
import { isMobile } from "../../../util/data/isMobile.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


const levelText = `


______WWWWWWWW
______W      W
______W i    W
______W      W
__WWWWW    v W
__W          W
__W f   F    W
__W          W
__WWWWWWWWWWWW
______W      W
___b__W w    W
___i__W i  B W
___y__W s    W
______W      W
______WWWWWWWW
`;

export const lev_tutorial01 = new Level("0234f0a1", "Where do you go?", {
    width: 18,
    height: 18,
    startingEntities: makeLevelGridFromString(levelText, _commonKey),
    background: [
        {
            texture: isMobile() ? textures.background.pause_hint_mobile : textures.background.pause_hint_desktop,
            x: 2,
            y: 1
        }
    ]
});