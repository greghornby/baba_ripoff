import { NounSelector, Word } from "../main/Word.js";
import { behaviorNoun } from "../util/behaviorNounAndComplement.js";
import { colors } from "./colors.js";
import { constructs } from "./constructs.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const words = {

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
		texture: texturePlaceholder,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.baba)) //@todo placeholder
		}
	}),

    baba: new Word("baba", {
		texture: textures.words.baba,
		color: colors.pink,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.baba))
		}
	}),

    is: new Word("is", {
		texture: textures.words.is,
		behavior: {
            verb: true
		}
	}),

    you: new Word("you", {
		texture: textures.words.you,
		behavior: {
            tag: true
		}
	}),

	win: new Word("win", {
		texture: textures.words.win,
		behavior: {
            tag: true
		}
	}),

	stop: new Word("stop", {
		texture: textures.words.stop,
		behavior: {
            tag: true
		}
	}),

	push: new Word("push", {
		texture: textures.words.push,
		behavior: {
            tag: true
		}
	}),

    not: new Word("not", {
		texture: textures.words.not,
		behavior: {
            not: true
		}
	}),

    and: new Word("and", {
		texture: texturePlaceholder,
		behavior: {
            and: true
		}
	}),

    lonely: new Word("lonely", {
		texture: texturePlaceholder,
		behavior: {
            prefixCondition: true
		}
	}),

    powered: new Word("powered", {
		texture: texturePlaceholder,
		behavior: {
            prefixCondition: true
		}
	}),

    on: new Word("on", {
		texture: texturePlaceholder,
		behavior: {
            postCondition: {wordTypes: ["noun"]}
		}
	}),

    facing: new Word("facing", {
		texture: texturePlaceholder,
		behavior: {
            postCondition: {wordTypes: ["noun"]}
		}
	}),

    near: new Word("near", {
		texture: texturePlaceholder,
		behavior: {
            postCondition: {wordTypes: ["noun"]}
		}
	}),

    wall: new Word("wall", {
		texture: textures.words.wall,
		color: colors.brightBlue,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.wall))
		}
	}),

	rock: new Word("rock", {
		texture: textures.words.rock,
		color: colors.brightBrown,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.rock))
		}
	}),

	flag: new Word("flag", {
		texture: textures.words.flag,
		color: colors.gold,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.flag))
		}
	}),

    leaf: new Word("leaf", {
		texture: texturePlaceholder,
		color: colors.darkGreen,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.leaf))
		}
	}),
}