import { NounSelector, Word } from "../../classes/Word.js";
import { behaviorNounBoth } from "../../util/words/behaviorNounAndComplement.js";
import { constructs } from "../constructs.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    not: new Word("not", {
        texture: textures.words.not_anim,
        behavior: {
            not: true
        }
    }),

    and: new Word("and", {
        texture: textures.words.and_anim,
        behavior: {
            and: true
        }
    }),

    text: new Word("text", {
        texture: textures.words.text_anim,
        behavior: {
            noun: {
                subject: new NounSelector.compareLevelConstructs(construct => construct instanceof Word),
                compliment: new NounSelector.fromEntity(entity => [entity.construct.word])
            }
        }
    }),

    all: new Word("all", {
        texture: textures.words.all,
        behavior: {
            noun: behaviorNounBoth(new NounSelector.single(constructs.baba)) //@todo placeholder
        }
    }),
}