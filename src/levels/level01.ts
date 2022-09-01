import { Level } from "../main/Level.js";
import { makeLevelGridFromString } from "../util/makeLevelGridFromString.js";
import { _commonKey } from "./_commonKey.js";


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

export const level01 = () => new Level({
    width: 18,
    height: 18,
    startingEntities: makeLevelGridFromString(levelText, _commonKey)
});