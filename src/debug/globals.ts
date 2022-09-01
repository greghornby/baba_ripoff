import { Construct } from "../main/Construct.js"
import { Level } from "../main/Level.js"
import { LevelController } from "../main/LevelController.js"
import { Rule } from "../main/Rule.js"
import { Sentence } from "../main/Sentence.js"
import { Word } from "../main/Word.js"

export const exposeGlobals = () => {
    Object.assign(globalThis as any, {
        Construct,
        Level,
        LevelController,
        Rule,
        Sentence,
        Word
    });
}