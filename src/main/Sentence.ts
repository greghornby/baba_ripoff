import { IRule, NegatableWord, Rule } from "./Rule.js";
import { Word, WordBehavior } from "./Word.js";

export class Sentence {

    static fromString(text: string) {
        const words = text.replace(/ +/g, " ").split(" ").map(word => Word.findWordFromText(word));
        return new Sentence(words);
    }

    static ruleToTextArray(ruleInstance: Rule): string[] {
        type StringOptArray = (string | undefined)[];
        const rule = ruleInstance.rule;

        const insertAnds = <T>(
            _data: T[] | undefined,
            sorter: (a: T, b: T) => number,
            mapper: (item: T) => StringOptArray
        ): StringOptArray => {
            const fragment: StringOptArray = [];
            if (!_data) {
                return fragment;
            }
            const data = [..._data].sort(sorter);
            const dataLength = data.length;
            for (let i = 0; i < dataLength; i++) {
                const item = data[i];
                fragment.push(
                    ...mapper(item)
                );
                if (dataLength > 1 && i !== dataLength -1) {
                    fragment.push("and");
                }
            }
            return fragment;
        }

        const sentence: StringOptArray = [

            ...insertAnds(
                rule.preCondition,
                (a, b) => a.word.word.localeCompare(b.word.word),
                item => [item.not ? "not" : undefined, item.word.word]
            ),

            ...insertAnds(
                rule.subjects,
                (a, b) => a.word.word.localeCompare(b.word.word),
                item => [item.not ? "not" : undefined, item.word.word]
            ),

            ...insertAnds(
                rule.postCondition,
                (a, b) => a.word.word.localeCompare(b.word.word),
                item => [
                    item.not ? "not" : undefined,
                    item.word.word,
                    ...insertAnds(
                        item.selector,
                        (a, b) => a.word.localeCompare(b.word),
                        item => [item.word]
                    )
                ]
            ),

            rule.verb.word,

            ...insertAnds(
                rule.complements,
                (a, b) => a.word.word.localeCompare(b.word.word),
                item => [item.not ? "not" : undefined, item.word.word]
            )
        ];
        return sentence.filter(e => e) as string[];
    }

    constructor(public words: Word[]) {}

    getRules(): Rule[] {
        const rules: Rule[] = [];

        let wordsRemaining = [...this.words];
        while (wordsRemaining.length) {
            let preCondition: IRule["preCondition"];
            let subjects: IRule["subjects"];
            let postCondition: IRule["postCondition"];
            let verb: IRule["verb"];
            let complements: IRule["complements"];
            const startResult = this.findRuleStart(wordsRemaining);
            if (!startResult) {
                break;
            }
            wordsRemaining = startResult.wordsRemaining;
            let preConResult = this.parsePreConditionFragment(wordsRemaining);
            if (preConResult) {
                preCondition = preConResult.data;
                wordsRemaining = preConResult.wordsRemaining;
            }
            let nounsResult = this.parseSimpleConjuctionWords(wordsRemaining, ["noun"]);
            if (!nounsResult) {
                continue;
            }
            subjects = nounsResult.data;
            wordsRemaining = nounsResult.wordsRemaining;
            let verbResult = this.parseVerbFragment(wordsRemaining);
            if (!verbResult) {
                continue;
            }
            verb = verbResult.data;
            wordsRemaining = verbResult.wordsRemaining;
            let complementsResult = this.parseSimpleConjuctionWords(wordsRemaining, ["noun", "tag"]);
            if (!complementsResult) {
                continue;
            }
            complements = complementsResult.data;
            wordsRemaining = complementsResult.wordsRemaining;

            const rule = new Rule({
                preCondition: preCondition,
                subjects: subjects,
                postCondition: postCondition,
                verb: verb,
                complements: complements
            });
            rules.push(rule);
        }

        return rules;
    }


    findRuleStart(words: Word[]): IFragmentOutput<undefined> {
        const allowedStartingWords: WordType[] = ["not", "prefixCondition", "noun"];
        const discardedFragment: Word[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            let allowed = false;
            for (const allowedWord of allowedStartingWords) {
                if (behavior[allowedWord]) {
                    allowed = true;
                    break;
                }
            }
            if (!allowed) {
                discardedFragment.push(word);
            } else {
                break;
            }
        }
        return {
            data: undefined,
            fragment: discardedFragment,
            wordsRemaining: words.slice(i)
        };
    }


    parsePreConditionFragment(words: Word[]): IFragmentOutput<IRule["preCondition"]> {
        let validIndex = -1;
        let not = false;
        let checkForAnd = false;
        let conditions: NegatableWord[] = [];
        const fragment: Word[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(word);
                    checkForAnd = false;
                    validIndex = -1;
                    continue;
                } else {
                    break;
                }
            } else {
                if (behavior.not) {
                    fragment.push(word);
                    not = !not;
                } else if (behavior.prefixCondition) {
                    fragment.push(word);
                    conditions.push({word: word, not: not});
                    not = false;
                    validIndex = i;
                    break;
                } else {
                    break;
                }
            }
        }
        if (validIndex < 0) {
            return false;
        } else {
            return {
                data: conditions,
                fragment: fragment,
                wordsRemaining: words.slice(validIndex+1)
            };
        }
    }


    parseSimpleConjuctionWords(words: Word[], allowedTypes: WordType[]): IFragmentOutput<NegatableWord[]> {
        let validIndex = -1;
        let checkForAnd = false;
        let not = false;
        const fragment: Word[] = [];
        const listWords: NegatableWord[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(word);
                    checkForAnd = false;
                    validIndex = -1;
                    continue;
                } else {
                    break;
                }
            } else {
                if (behavior.not) {
                    not = !not;
                    fragment.push(word);
                    continue;
                }
                let currentWordIsAllowed = false;
                for (const allowedType of allowedTypes) {
                    if (behavior[allowedType]) {
                        currentWordIsAllowed = true;
                        break;
                    }
                }
                if (currentWordIsAllowed) {
                    fragment.push(word);
                    listWords.push({word, not});
                    checkForAnd = true;
                    not = false;
                    validIndex = i;
                    continue;
                }
            }
        }

        if (validIndex < 0) {
            return false;
        } else {
            return {
                data: listWords,
                fragment: fragment,
                wordsRemaining: words.slice(validIndex+1)
            };
        }
    }


    parsePostConditionFragment(words: Word[]): IFragmentOutput<IRule["postCondition"]> {
        return undefined as any;
    }


    parseVerbFragment(words: Word[]): IFragmentOutput<IRule["verb"]> {
        const word = words[0];
        if (word.behavior.verb) {
            return {
                data: word,
                fragment: [word],
                wordsRemaining: words.slice(1)
            };
        } else {
            return false;
        }
    }
}

type WordType = keyof WordBehavior;
type IFragmentOutput<T> = {data: T; fragment: Word[]; wordsRemaining: Word[]} | false;