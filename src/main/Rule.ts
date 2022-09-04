import { Entity } from "./Entity.js";
import { Sentence } from "./Sentence.js";
import { Word } from "./Word.js";

export class Rule {
    constructor(
        public rule: IRule,
        public fromSentence?: Sentence
    ) {}

    static word: StaticWordMethod = <StaticWordMethod>((word: Word, invert?: true): RuleNegatableWrapper => {
        return {not: invert ? !false : false, word: word};
    });

    static notWord: StaticWordMethod = <StaticWordMethod>((word: Word, invert?: true): RuleNegatableWrapper => {
        return {not: invert ? !true : true, word: word};
    });
}
Rule.word.not = Rule.notWord;
Rule.notWord.not = Rule.word;

interface StaticWordMethod {
    (word: Word, invert?: true): RuleNegatableWrapper;
    not: StaticWordMethod;
}

export interface IRule {
    preCondition?: RuleNegatableWrapper[];
    postCondition?: (RuleNegatableWrapper & {selector: RuleNegatableWrapper[]})[];
    subject: RuleNegatableWrapper;
    verb: RuleWordWrapper;
    complement: RuleNegatableWrapper;
}

export interface RuleWordWrapper {
    word: Word;
    entity?: Entity;
}

export interface RuleNegatableWrapper extends RuleWordWrapper {
    not: boolean;
}