import { App } from "../app/App.js"
import { LevelController } from "../controllers/LevelController.js"
import { MenuController } from "../menu/MenuController.js"
import { Construct } from "../object_classes/Construct.js"
import { Level } from "../object_classes/Level.js"
import { Rule } from "../object_classes/Rule.js"
import { Sentence } from "../object_classes/Sentence.js"
import { Word } from "../object_classes/Word.js"
import { replayInteractions } from "../util/replay/replayInteractions.js"

export const exposeGlobals = () => {
    Object.assign(globalThis as any, {
        MenuController,
        App,
        Construct,
        Level,
        LevelController,
        Rule,
        Sentence,
        Word,
        replayInteractions
    });
}