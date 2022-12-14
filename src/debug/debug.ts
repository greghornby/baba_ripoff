import { Entity } from "../classes/Entity.js";
import { Sentence } from "../classes/Sentence.js";
import { Word } from "../classes/Word.js";
import { LevelController } from "../controllers/LevelController.js";

const _debug = {

    printEntityTags(controller: LevelController) {
        const wordString = (w: Word) => w.text;
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
    },

    printRules(controller: LevelController) {
        const rules = controller.rules;
        for (const rule of rules) {
            console.log("Rule:", ...Sentence.ruleToTextArray(rule));
        }
    }
};

export const initDebug = () => {
    (globalThis as any)._debug = _debug;
};
