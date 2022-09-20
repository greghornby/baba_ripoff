import { App } from "../app/App.js"
import { Construct } from "../classes/Construct.js"
import { Level } from "../classes/Level.js"
import { Rule } from "../classes/Rule.js"
import { Sentence } from "../classes/Sentence.js"
import { Word } from "../classes/Word.js"
import { LevelController } from "../controllers/LevelController.js"
import { MenuController } from "../menu/MenuController.js"
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