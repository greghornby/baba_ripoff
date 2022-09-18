import { App } from "../app/App.js"
import { Construct } from "../main/Construct.js"
import { Level } from "../main/Level.js"
import { LevelController } from "../main/LevelController.js"
import { MenuController } from "../main/main_menu/MenuController.js"
import { Rule } from "../main/Rule.js"
import { Sentence } from "../main/Sentence.js"
import { Word } from "../main/Word.js"
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