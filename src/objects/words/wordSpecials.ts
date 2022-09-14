import { NounSelector, Word } from "../../main/Word.js";
import { behaviorNoun } from "../../util/words/behaviorNounAndComplement.js";
import { colors } from "../colors.js";
import { constructs } from "../constructs.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    not: new Word("not", {
		texture: textures.words.not,
		behavior: {
            not: true
		}
	}),

    and: new Word("and", {
		texture: textures.words.and,
		behavior: {
            and: true
		}
	}),

    text: new Word("text", {
		texture: textures.words.text,
		behavior: {
			noun: {
				subject: new NounSelector.compareLevelConstructs(construct => construct instanceof Word),
				compliment: new NounSelector.fromEntity(entity => [entity.construct.associatedWord()])
			}
		}
	}),

    all: new Word("all", {
		texture: textures.words.all,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.baba)) //@todo placeholder
		}
	}),
}