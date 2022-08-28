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
                if (dataLength > 1 && i !== dataLength - 1) {
                    fragment.push("and");
                }
            }
            return fragment;
        }

        const sentence: StringOptArray = [

            ...insertAnds(
                rule.preCondition,
                (a, b) => a.word._string.localeCompare(b.word._string),
                item => [item.not ? "not" : undefined, item.word._string]
            ),

            rule.subject.not ? "not" : undefined,
            rule.subject.word._string,

            ...insertAnds(
                rule.postCondition,
                (a, b) => a.word._string.localeCompare(b.word._string),
                item => [
                    item.not ? "not" : undefined,
                    item.word._string,
                    ...insertAnds(
                        item.selector,
                        (a, b) => a.word._string.localeCompare(b.word._string),
                        item => [item.not ? "not" : undefined, item.word._string]
                    )
                ]
            ),

            rule.verb._string,

            rule.complement.not ? "not" : undefined,
            rule.complement.word._string
        ];
        return sentence.filter(e => e) as string[];
    }

    constructor(public words: Word[]) {}

    isPotentiallyASentence(): boolean {
        return this.words.length >= 3;
    }

    getRules(): Rule[] {
        if (!this.isPotentiallyASentence) {
            return [];
        }
        const rules: Rule[] = [];

        let wordsRemaining = [...this.words];
        while (wordsRemaining.length) {
            let preCondition: IRule["preCondition"];
            let subjects: IRule["subject"][];
            let postCondition: IRule["postCondition"];
            let verb: IRule["verb"];
            let complements: IRule["complement"][];
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
            let postConResult = this.parsePostConditionFragment(wordsRemaining);
            if (postConResult) {
                postCondition = postConResult.data;
                wordsRemaining = postConResult.wordsRemaining;
            }
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

            for (const subject of subjects) {
                for (const complement of complements) {

                    const rule = new Rule({
                        preCondition: preCondition,
                        subject: subject,
                        postCondition: postCondition,
                        verb: verb,
                        complement: complement
                    });
                    rules.push(rule);
                }
            }
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
            wordsRemaining: words.slice(discardedFragment.length)
        };
    }


    parsePreConditionFragment(words: Word[]): IFragmentOutput<IRule["preCondition"]> {
        let valid = false;
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
                    valid = false;
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
                    valid = true;
                    break;
                } else {
                    break;
                }
            }
        }
        if (!valid) {
            return false;
        } else {
            return {
                data: conditions,
                fragment: fragment,
                wordsRemaining: words.slice(fragment.length)
            };
        }
    }


    parseSimpleConjuctionWords(words: Word[], allowedTypes: WordType[]): IFragmentOutput<NegatableWord[]> {
        let valid = false;
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
                    valid = false;
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
                    valid = true;
                    continue;
                }
            }
        }

        if (!valid) {
            return false;
        } else {
            return {
                data: listWords,
                fragment: fragment,
                wordsRemaining: words.slice(fragment.length)
            };
        }
    }


    parsePostConditionFragment(words: Word[]): IFragmentOutput<IRule["postCondition"]> {
        let valid = false;
        let not = false;
        let checkForAnd = false;
        let checkForSelector = false;
        let currentCondition: NegatableWord | undefined;
        let currentSelectors: NegatableWord[] = [];
        let conditions: IRule["postCondition"] = [];

        const conditionAllowsWord = (conditionWord: Word, word: Word): boolean => {
            for (const key of Object.keys(word.behavior) as WordType[]) {
                if (
                    word.behavior[key] &&
                    (conditionWord.behavior.postCondition?.wordTypes ?? []).includes(key)
                ) {
                    return true;
                }
            }
            return false;
        };

        const fragment: Word[] = [];
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(word);
                    checkForAnd = false;
                    valid = false;
                    continue;
                } else {
                    conditions.push({...currentCondition!, selector: currentSelectors});
                    break;
                }
            } else if (checkForSelector) {
                if (conditionAllowsWord(currentCondition!.word, word)) {
                    fragment.push(word);
                    currentSelectors.push({word: word, not: not});
                    not = false;
                    checkForSelector = false;
                    checkForAnd = true;
                    valid = true;
                }
            } else {
                if (behavior.not) {
                    fragment.push(word);
                    not = !not;
                } else if (behavior.postCondition) {
                    if (currentCondition) {
                        conditions.push({...currentCondition, selector: currentSelectors});
                    }
                    currentCondition = {word: word, not: not};
                    currentSelectors = [];
                    valid = false;
                    not = false;
                    checkForSelector = true;
                    fragment.push(word);
                    continue;
                } else if (currentCondition && conditionAllowsWord(currentCondition.word, word)) {
                    fragment.push(word);
                    currentSelectors.push({word: word, not: not});
                    not = false;
                    checkForAnd = true;
                    valid = true;
                } else {
                    if (currentCondition) {
                        conditions.push({...currentCondition, selector: currentSelectors});
                    }
                    break;
                }
            }
        }
        if (!valid) {
            return false;
        } else {
            return {
                data: conditions,
                fragment: fragment,
                wordsRemaining: words.slice(fragment.length)
            };
        }
    }


    parseVerbFragment(words: Word[]): IFragmentOutput<IRule["verb"]> {
        const word = words[0];
        const fragment: Word[] = [];
        if (word.behavior.verb) {
            fragment.push(word);
            return {
                data: word,
                fragment: [word],
                wordsRemaining: words.slice(fragment.length)
            };
        } else {
            return false;
        }
    }
}

type WordType = keyof WordBehavior;
type IFragmentOutput<T> = {data: T; fragment: Word[]; wordsRemaining: Word[]} | false;