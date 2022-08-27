import { Entity } from "../main/Entity.js";
import { LevelController } from "../main/LevelController.js";
import { Word } from "../main/Word.js";

const _debug = {

    printEntityTags(controller: LevelController) {
        const wordString = (w: Word) => w._string;
        const entityString = (e: Entity) => `${e.name}:${e.x}:${e.y}`;

        const objTagToEntities: any = {};
        const objEntityToTags: any = {};

        for (const [word, entities] of controller.tagToEntities) {
            objTagToEntities[wordString(word)] = [...entities].map(e => entityString(e));
        }
        for (const [entity, words] of controller.entityToTags) {
            objEntityToTags[entityString(entity)] = [...words].map(w => wordString(w));
        }
        console.log("TAG TO ENTITIES", JSON.stringify(objTagToEntities, null, 2));
        console.log("ENTITY TO TAGS", JSON.stringify(objEntityToTags, null, 2));
    }
};

export const initDebug = () => {
    (globalThis as any)._debug = _debug;
};
