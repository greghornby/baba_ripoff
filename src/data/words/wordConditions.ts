import { Word } from "../../object_classes/Word.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

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

}