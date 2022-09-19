import { LevelPack } from "./LevelPack.js";
import { lev_debug01 } from "./packs/debug/lev_debug01.js";
import { lev_debug02 } from "./packs/debug/lev_debug02.js";
import { lev_iM01 } from "./packs/innerMechinations/lev_iM01.js";
import { lev_iM02 } from "./packs/innerMechinations/lev_iM02.js";
import { lev_tutorial00 } from "./packs/tutorial/lev_tutorial00.js";
import { lev_tutorial01 } from "./packs/tutorial/lev_tutorial01.js";

export const mainPack = new LevelPack("Main", [

    new LevelPack("Tutorial", [
        lev_tutorial00,
        lev_tutorial01
    ]),

    new LevelPack("Inner Mechinations", [
        lev_iM01,
        lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02,
        // lev_iM02
    ]),

    new LevelPack("Debug", [
        lev_debug01,
        lev_debug02
    ])
])