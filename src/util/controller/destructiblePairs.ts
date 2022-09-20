import { Entity } from "../../classes/Entity.js";
import { Word } from "../../classes/Word.js";
import { LevelController } from "../../controllers/LevelController.js";
import { words } from "../../data/words.js";
import { iterableFind } from "../data/iterableFind.js";

export function destructiblePairs(): Entity[] {
    const controller = LevelController.instance!;
    const marked: Entity[] = [];
    for (const pair of PAIRS) {
        const entitiesToDesroyFromTrap = processTrap(controller, pair);
        if (entitiesToDesroyFromTrap) {
            marked.push(...entitiesToDesroyFromTrap);
        }
    }
    return marked;
}

/** Returns undefined if nothing happens or an array of entities to be marked for destruction */
const processedTrapEntities = new Set<Entity>(); //re-usable
const processedVictimEntities = new Set<Entity>(); //re-usable
const marked: Entity[] = []; //re-usable
function processTrap(controller: LevelController, trap: DestructiblePair): readonly Entity[] | undefined {
    const trapEntities = trap.findTrap(controller);
    if (!trapEntities) {
        return;
    }
    processedTrapEntities.clear();
    processedVictimEntities.clear();
    marked.length = 0; //clear
    traps:
    for (const trapEntity of trapEntities) {
        if (processedTrapEntities.has(trapEntity)) {
            continue traps;
        }
        processedTrapEntities.add(trapEntity);
        const trapIsFloat = trap.floatDoesIgnore ? controller.entityToTags.get(trapEntity)?.has(words.float) ?? false : false;
        let victims = trap.findVictims(controller, trapEntity);
        if (trap.killType === "allVictims") {
            for (const victimEntity of victims) {
                if (trap.ignoreSelf && victimEntity === trapEntity) {
                    continue;
                }
                const victimIsFloat = controller.entityToTags.get(victimEntity)?.has(words.float) ?? false;
                const sameFloatLevel = (trapIsFloat && victimIsFloat) || (!trapIsFloat && !victimIsFloat);
                if (!sameFloatLevel) {
                    continue;
                }
                marked.push(victimEntity);
            }
            if (!trap.trapSurvives) {
                marked.push(trapEntity);
            }
            continue traps;
        }

        //if trap is also a victim and doesn't ignore itself, it deletes itself
        if (!trap.ignoreSelf) {
            if (iterableFind(victims, e => e === trapEntity)) {
                marked.push(trapEntity);
                continue traps;
            }
        }
        for (const victimEntity of victims) {
            if (processedVictimEntities.has(victimEntity)) {
                continue;
            }
            processedVictimEntities.add(victimEntity);
            if (trap.ignoreSelf && victimEntity === trapEntity) {
                continue;
            }
            if (trap.floatDoesIgnore) {
                const victimIsFloat = controller.entityToTags.get(victimEntity)?.has(words.float) ?? false;
                const sameFloatLevel = (trapIsFloat && victimIsFloat) || (!trapIsFloat && !victimIsFloat);
                if (!sameFloatLevel) {
                    continue;
                }
            }

            marked.push(victimEntity);
            if (!trap.trapSurvives) {
                marked.push(trapEntity);
            }
            break;
        }
    }
    return marked;
}

interface DestructiblePair {
    findTrap: (controller: LevelController) => Iterable<Entity> | undefined;
    /** If not set, just gets Entities on same tile for victim testing */
    findVictims: (controller: LevelController, trap: Entity) => Iterable<Entity>;
    ignoreSelf: boolean;
    trapSurvives: boolean;
    killType: "allVictims" | "oneVictim";
    floatDoesIgnore: boolean;
}

function victimsOnSameTileWithTag(tag: Word): DestructiblePair["findVictims"] {
    return (controller, trap) =>
        controller.getEntitiesAtPosition(trap.x, trap.y)
        .filter(e => controller.getEntityTags(e).has(tag));
}
function victimsOnSameTileWithoutTag(tag: Word): DestructiblePair["findVictims"] {
    return (controller, trap) =>
        controller.getEntitiesAtPosition(trap.x, trap.y)
        .filter(e => !controller.getEntityTags(e).has(tag));
}

const PAIRS: DestructiblePair[] = [

    // DEFEAT kills all YOU
    {
        findTrap: (controller) => controller.tagToEntities.get(words.defeat),
        findVictims: victimsOnSameTileWithTag(words.you),
        ignoreSelf: false,
        trapSurvives: true,
        killType: "allVictims",
        floatDoesIgnore: true,
    },

    // SHUT and OPEN destroy eachother
    {
        findTrap: (controller) => controller.getEntitiesByTag(words.shut),
        findVictims: victimsOnSameTileWithTag(words.open),
        ignoreSelf: false,
        trapSurvives: false,
        killType: "oneVictim",
        floatDoesIgnore: true,
    },

    // SINK destroys anything on it, one at a time
    {
        findTrap: (controller) => controller.getEntitiesByTag(words.sink),
        findVictims: (controller, trap) => controller.getEntitiesAtPosition(trap.x, trap.y),
        ignoreSelf: true,
        trapSurvives: false,
        killType: "oneVictim",
        floatDoesIgnore: true,
    },

    //HOT destroys MELT
    {
        findTrap: (controller) => controller.getEntitiesByTag(words.hot),
        findVictims: victimsOnSameTileWithTag(words.melt),
        ignoreSelf: false,
        trapSurvives: true,
        killType: "allVictims",
        floatDoesIgnore: true,
    }
]