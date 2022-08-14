import { Word } from "./Word.js";

export class Rule {
    constructor(
        public rule: IRule
    ) {}
}

export interface IRule {
    selector: IRuleSelector;
    verb: IRuleVerb;
    output: IRuleOutput;
}

export interface IRuleSelector {
    preCondition?: NegatableWord[];
    postCondition?: (NegatableWord & {selector: Word[]})[];
    nouns: NegatableWord[];
}

export interface IRuleVerb {
    verb: Word;
}

export interface IRuleOutput {
    outputs: NegatableWord[];
}

export interface NegatableWord {
    word: Word;
    not: boolean;
}