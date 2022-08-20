import { Word } from "../main/Word.js";
import { constructs } from "./constructs.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const words = {

    text: new Word("text", {
		texture: texturePlaceholder,
		behavior: {
            noun: {selector: (construct) => construct instanceof Word}
		}
	}),

    baba: new Word("baba", {
		texture: textures.words.baba,
		behavior: {
            noun: {selector: (construct) => construct === constructs.baba}
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

	stop: new Word("stop", {
		texture: textures.words.stop,
		behavior: {
            tag: true
		}
	}),

	push: new Word("push", {
		texture: texturePlaceholder,
		behavior: {
            tag: true
		}
	}),

    not: new Word("not", {
		texture: texturePlaceholder,
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
		behavior: {
            noun: {selector: (construct) => construct === constructs.wall}
		}
	}),

    leaf: new Word("leaf", {
		texture: texturePlaceholder,
		behavior: {
            noun: {selector: (construct) => construct === constructs.leaf}
		}
	}),
}