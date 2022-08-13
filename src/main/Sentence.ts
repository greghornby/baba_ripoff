import { IRule, IRuleOutput, IRuleSelector, IRuleVerb, NegatableWord, Rule } from "./Rule.js";
import { Word, WordBehavior } from "./Word.js";

export class Sentence {
    constructor(public words: Word[]) {}

    getRules(): Rule[] {
        const rules: Rule[] = [];

        let wordsRemaining = [...this.words];
        while (wordsRemaining.length) {
            let preCondition: IRuleSelector["preCondition"];
            let selectorNouns: IRuleSelector["nouns"];
            let postCondition: IRuleSelector["postCondition"];
            let verb: IRuleVerb["verb"];
            let outputs: IRuleOutput["outputs"];
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
            selectorNouns = nounsResult.data;
            wordsRemaining = nounsResult.wordsRemaining;
            let verbResult = this.parseVerbFragment(wordsRemaining);
            if (!verbResult) {
                continue;
            }
            verb = verbResult.data;
            wordsRemaining = verbResult.wordsRemaining;
            let outputsResult = this.parseSimpleConjuctionWords(wordsRemaining, ["noun", "tag"]);
            if (!outputsResult) {
                continue;
            }
            outputs = outputsResult.data;
            wordsRemaining = outputsResult.wordsRemaining;

            const rule = new Rule({
                selector: {
                    preCondition: preCondition,
                    nouns: selectorNouns,
                    postCondition: postCondition
                },
                verb: {
                    verb: verb
                },
                output: {
                    outputs: outputs
                }
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
            for (const allowedWord of allowedStartingWords) {
                if (!behavior[allowedWord]) {
                    discardedFragment.push(word);
                } else {
                    break;
                }
            }
        }
        return {
            data: undefined,
            fragment: discardedFragment,
            wordsRemaining: words.slice(i+1)
        };
    }


    parsePreConditionFragment(words: Word[]): IFragmentOutput<IRuleSelector["preCondition"]> {
        let not = false;
        let conditionWord: Word | undefined;
        const fragment: Word[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (behavior.not) {
                fragment.push(word);
                not = !not;
            } else if (behavior.prefixCondition) {
                fragment.push(word);
                conditionWord = word;
                break;
            } else {
                break;
            }
        }
        if (conditionWord) {
            return {
                data: {
                    word: conditionWord,
                    not: not
                },
                fragment: fragment,
                wordsRemaining: words.slice(i+1)
            };
        } else {
            return false;
        }
    }


    parseSimpleConjuctionWords(words: Word[], allowedTypes: WordType[]): IFragmentOutput<NegatableWord[]> {
        let valid = false;
        let shouldBeAnd = false;
        let not = false;
        const fragment: Word[] = [];
        const listWords: NegatableWord[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (shouldBeAnd) {
                if (behavior.and) {
                    fragment.push(word);
                    shouldBeAnd = false;
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
                    shouldBeAnd = true;
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
                wordsRemaining: words.slice(i+1)
            };
        }
    }


    parsePostConditionFragment(words: Word[]): IFragmentOutput<IRuleSelector["postCondition"]> {
        return undefined as any;
    }


    parseVerbFragment(words: Word[]): IFragmentOutput<IRuleVerb["verb"]> {
        return undefined as any;
    }
}

type WordType = keyof WordBehavior;
type IFragmentOutput<T> = {data: T; fragment: Word[]; wordsRemaining: Word[]} | false;