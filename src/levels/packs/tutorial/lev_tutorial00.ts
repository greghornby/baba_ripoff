import { Level } from "../../../main/Level.js";
import { textures } from "../../../objects/textures.js";
import { Direction } from "../../../types/Direction.js";
import { isMobile } from "../../../util/data/isMobile.js";
import { makeLevelGridFromString } from "../../../util/temp/makeLevelGridFromString.js";
import { _commonKey } from "../../_commonKey.js";


const levelText = `
___
___
___
___
__biy     fiv
___
__WWWWWWWWWWW
_______R
___?   R   F
_______R
__WWWWWWWWWWW
__
__wis     rip
`;

export const lev_tutorial00 = new Level("52d674ab", "Welcome", {
    width: 15,
    height: 14,
    startingEntities: makeLevelGridFromString(levelText, _commonKey, [
        ["B", e => e.setFacing(Direction.right)]
    ]),
    background: [
        {
            texture: isMobile() ? textures.background.move_hint_mobile : textures.background.move_hint_desktop,
            x: 6,
            y: 1
        }
    ]
});