import { Construct } from "../Construct.js";
import { Word } from "../Word.js";

export class Noun extends Word {
    constructor(
        public nounSelector: NounSelectorFunction
    ) {
        super();
    }
}

type NounSelectorFunction = (construct: Construct) => boolean;