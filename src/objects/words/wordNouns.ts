import { NounSelector, Word } from "../../main/Word.js";
import { behaviorNoun } from "../../util/words/behaviorNounAndComplement.js";
import { colors } from "../colors.js";
import { constructs } from "../constructs.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    baba: new Word("baba", {
		texture: textures.words.baba_anim,
		color: colors.pink,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.baba))
		}
	}),


    wall: new Word("wall", {
		texture: textures.words.wall_anim,
		color: colors.brightBlue,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.wall))
		}
	}),

	key: new Word("key", {
		texture: textures.words.key,
		color: colors.gold,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.key))
		}
	}),

	door: new Word("door", {
		texture: textures.words.door,
		color: colors.stop,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.door))
		}
	}),

	rock: new Word("rock", {
		texture: textures.words.rock_anim,
		color: colors.brightBrown,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.rock))
		}
	}),

	flag: new Word("flag", {
		texture: textures.words.flag_anim,
		color: colors.gold,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.flag))
		}
	}),

    leaf: new Word("leaf", {
		texture: textures.words.leaf,
		color: colors.darkGreen,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.leaf))
		}
	}),

	skull: new Word("skull", {
		texture: textures.words.skull,
		color: 0xa61b03,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.skull))
		}
	}),

	belt: new Word("belt", {
		texture: textures.words.belt,
		color: colors.white,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.belt))
		}
	}),

	lava: new Word("lava", {
		texture: textures.words.lava,
		color: colors.lava,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.lava))
		}
	}),

	water: new Word("water", {
		texture: textures.words.water,
		color: colors.water,
		behavior: {
			noun: behaviorNoun(new NounSelector.single(constructs.water))
		}
	}),
}