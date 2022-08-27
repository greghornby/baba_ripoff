import { LevelController } from "../main/LevelController.js";

const _debug = {

    printEntityTags(controller: LevelController) {
        const obj: any = {};
        for (const [word, entities] of controller.entityTags) {
            obj[word._string] = [...entities].map(e => `${e.name}:${e.x}:${e.y}`);
        }
        console.log(JSON.stringify(obj, null, 2));
    }
};

export const initDebug = () => {
    (globalThis as any)._debug = _debug;
};
