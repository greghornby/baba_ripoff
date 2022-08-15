import { Word } from "./Word.js";

export class Rule {
    constructor(
        public rule: IRule
    ) {}
}

export interface IRule {
    preCondition?: NegatableWord[];
    postCondition?: (NegatableWord & {selector: Word[]})[];
    subject: NegatableWord;
    verb: Word;
    complement: NegatableWord;
}

export interface NegatableWord {
    word: Word;
    not: boolean;
}