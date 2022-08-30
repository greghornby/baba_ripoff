import { categories } from "../objects/categories.js";
import { colors } from "../objects/colors.js";
import { Construct, ConstructData } from "./Construct.js";
import { Level } from "./Level.js";

export class Word extends Construct {

    static words: Word[] = [];

    static findWordFromText(text: string): Word {
        const result = this.words.find(word => word._string === text);
        if (!result) {
            throw new Error(`Could not find Word from text "${text}"`);
        }
        return result;
    }

    public behavior: WordBehavior

    constructor(
        public readonly _string: string,
        data: Omit<ConstructData, "associatedWord" | "category" | "color"> & {behavior: WordBehavior},
    ) {
        super({
            ...data,
            associatedWord: () => this,
            category: categories.text,
            color: colors.textActive
        });
        this._string = this._string.toLowerCase();
        this.behavior = data.behavior;
        Word.words.push(this);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            word: this._string,
            behavior: this.behavior
        };
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
        wordTypes: (keyof WordBehavior)[];
    };
}