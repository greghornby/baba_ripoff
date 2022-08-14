import { Word } from "./Word.js";

export class Rule {
    constructor(
        public rule: IRule
    ) {}
}

export interface IRule {
    preCondition?: NegatableWord[];
    postCondition?: (NegatableWord & {selector: Word[]})[];
    subjects: NegatableWord[];
    verb: Word;
    complements: NegatableWord[];
}

export interface NegatableWord {
    word: Word;
    not: boolean;
}