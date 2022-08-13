import { Construct, ConstructData } from "./Construct.js";
import { Entity } from "./Entity.js";
import { Level } from "./Level.js";

export class Word extends Construct {

    static words: Word[] = [];

    constructor(
        data: ConstructData,
        public readonly word: string,
        public behavior: WordBehavior
    ) {
        super(data);
        this.word = this.word.toLowerCase();
        Word.words.push(this);
    }
}


export interface WordBehavior {
    noun?: {
        selector: (construct: Construct, level: Level) => boolean;
    };
    tag?: true;
    verb?: boolean;
    not?: boolean;
    and?: boolean;
    prefixCondition?: boolean;
    postCondition?: {
        wordType: keyof WordBehavior;
    };
}