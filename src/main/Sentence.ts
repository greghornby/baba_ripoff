import { IRuleOutput, IRuleSelector, IRuleVerb, NegatableWord, Rule } from "./Rule.js";
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
                if (i !== 0 && i !== dataLength -1) {
                    fragment.push("and");
                }
            }
            return fragment;
        }

        const sentence: StringOptArray = [

            rule.selector.preCondition?.not ? "not" : undefined,
            rule.selector.preCondition?.word.word,

            ...insertAnds(
                rule.selector.nouns,
                (a, b) => a.word.word.localeCompare(b.word.word),
                item => [item.not ? "not" : undefined, item.word.word]
            ),

            rule.selector.postCondition?.not ? "not" : undefined,
            rule.selector.postCondition?.word.word,
            ...insertAnds(
                rule.selector.postCondition?.conditionSelector,
                (a, b) => a.word.localeCompare(b.word),
                item => [item.word]
            ),

            rule.verb.verb.word.word,
            rule.verb.verb.not ? "not" : undefined,

            ...insertAnds(
                rule.output.outputs,
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
        let validIndex = -1;
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
                    shouldBeAnd = true;
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


    parsePostConditionFragment(words: Word[]): IFragmentOutput<IRuleSelector["postCondition"]> {
        return undefined as any;
    }


    parseVerbFragment(words: Word[]): IFragmentOutput<IRuleVerb["verb"]> {
        let validIndex = -1;
        let verb: Word | undefined;
        let checkForNot = false;
        let not = false;
        const fragment: Word[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const word = words[i];
            const behavior = word.behavior;
            if (!checkForNot) {
                if (behavior.verb) {
                    verb = word;
                    fragment.push(word);
                    checkForNot = true;
                    validIndex = i;
                    continue;
                } else {
                    validIndex = -1;
                    break;
                }
            } else {
                if (behavior.not) {
                    fragment.push(word);
                    not = !not;
                    validIndex = i;
                    continue;
                } else {
                    break;
                }
            }
        }

        if (validIndex < 0) {
            return false;
        } else {
            return {
                data: {
                    not: not,
                    word: verb!
                },
                fragment: fragment,
                wordsRemaining: words.slice(validIndex+1)
            };
        }
    }
}

type WordType = keyof WordBehavior;
type IFragmentOutput<T> = {data: T; fragment: Word[]; wordsRemaining: Word[]} | false;