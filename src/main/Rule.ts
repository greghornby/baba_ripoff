import { Word } from "./Word.js";

export class Rule {
    constructor(
        public rule: IRule
    ) {}

    static word: StaticWordMethod = <StaticWordMethod>((word: Word, invert?: true): NegatableWord => {
        return {not: invert ? !false : false, word: word};
    });

    static notWord: StaticWordMethod = <StaticWordMethod>((word: Word, invert?: true): NegatableWord => {
        return {not: invert ? !true : true, word: word};
    });
}
Rule.word.not = Rule.notWord;
Rule.notWord.not = Rule.word;

interface StaticWordMethod {
    (word: Word, invert?: true): NegatableWord;
    not: StaticWordMethod;
}

export interface IRule {
    preCondition?: NegatableWord[];
    postCondition?: (NegatableWord & {selector: NegatableWord[]})[];
    subject: NegatableWord;
    verb: Word;
    complement: NegatableWord;
}

export interface NegatableWord {
    word: Word;
    not: boolean;
}