import { categories } from "../objects/categories.js";
import { colors } from "../objects/colors.js";
import { Constants } from "./Constants.js";
import { Construct, ConstructData } from "./Construct.js";
import { Entity } from "./Entity.js";

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
        data:
            & Omit<ConstructData, "associatedWord" | "category" | "color">
            & Partial<Pick<ConstructData, "color">>
            & {behavior: WordBehavior},
    ) {
        super({
            associatedWord: () => this,
            category: categories.text,
            color: colors.textActive,
            ...data,
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
    // noun?:
    //     | {type: "single"; selector: Construct | NounSelectorCompareLevelConstructsFunction}
    //     | {type: "split"; subject: Construct | NounSelectorCompareLevelConstructsFunction; complement: Construct | NounSelectorCompareLevelConstructsFunction};
    noun?: {
        subject: InstanceType<INounSelector["single"] | INounSelector["compareLevelConstructs"]>; //only these 2 selectors apply
        compliment: InstanceType<INounSelector[keyof INounSelector]>; //all selectors apply
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

export type NounSelectorCompareLevelConstructsFunction = (testConstruct: Construct, thisWord: Word) => boolean;
export type NounSelectorCompareLevelConstructsWithEntityFunction = (entity: Entity, testConstruct: Construct, thisWord: Word) => boolean;
export type NounSelectorFromEntityFunction = (entity: Entity, thisWord: Word) => Construct[];

export const NounSelector = {
    single: class NounSelectorSingle {
        constructor(public construct: Construct) {}
    },
    compareLevelConstructs: class NounSelectorCompareLevelConstructs {
        constructor(public compareFn: NounSelectorCompareLevelConstructsFunction) {}
    },
    compareLevelConstructsWithEntityFunction: class NounSelectorCompareLevelConstructsWithEntity {
        constructor(public compareFn: NounSelectorCompareLevelConstructsWithEntityFunction) {}
    },
    fromEntity: class NounSelectorFromEntity {
        constructor(public entityFn: NounSelectorFromEntityFunction) {}
    }
}

export type INounSelector = typeof NounSelector;
export type INounSelectorType = InstanceType<INounSelector[keyof INounSelector]>;