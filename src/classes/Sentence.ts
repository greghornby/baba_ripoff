import { Entity } from "./Entity.js";
import { IRule, Rule, RuleNegatableWrapper } from "./Rule.js";
import { Word, WordBehavior } from "./Word.js";

export class Sentence {

    static startingWordTypes: WordType[] = ["not", "prefixCondition", "noun"];

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

            rule.verb.word._string,

            rule.complement.not ? "not" : undefined,
            rule.complement.word._string
        ];
        return sentence.filter(e => e) as string[];
    }


    public activeTextEntities: Set<Entity> = new Set();

    constructor(public words: Word[], public entities?: Entity[]) {}

    isPotentiallyASentence(): boolean {
        return this.words.length >= 3;
    }

    getRules(): Rule[] {
        if (!this.isPotentiallyASentence) {
            return [];
        }
        const rules: Rule[] = [];

        const wordsWithEntity: WordAndEntity[] = this.words.map((word, index) => ({word: word, entity: this.entities?.[index]}));

        let wordsRemaining: WordAndEntity[] = [...wordsWithEntity];
        while (wordsRemaining.length) {

            const activeEntities: Set<Entity> = new Set();
            const addActiveEntitiesFromFragment = (fragment: WordAndEntity[]) => {
                for (const item of fragment) {
                    if (item.entity) {
                        activeEntities.add(item.entity);
                    }
                }
            }

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
                addActiveEntitiesFromFragment(preConResult.fragment);
            }
            let nounsResult = this.parseSimpleConjuctionWords(wordsRemaining, ["noun"]);
            //@todo fix WALL AND here
            if (!nounsResult) {
                //special case, a noun should be found if the sentence had a start
                //to prevent infinite loop, remove first word from wordsRemaining
                wordsRemaining.shift();
                continue;
            }
            subjects = nounsResult.data;
            wordsRemaining = nounsResult.wordsRemaining;
            addActiveEntitiesFromFragment(nounsResult.fragment);
            let postConResult = this.parsePostConditionFragment(wordsRemaining);
            if (postConResult) {
                postCondition = postConResult.data;
                wordsRemaining = postConResult.wordsRemaining;
                addActiveEntitiesFromFragment(postConResult.fragment);
            }
            let verbResult = this.parseVerbFragment(wordsRemaining);
            if (!verbResult) {
                continue;
            }
            verb = verbResult.data;
            wordsRemaining = verbResult.wordsRemaining;
            addActiveEntitiesFromFragment(verbResult.fragment);
            let complementsResult = this.parseSimpleConjuctionWords(wordsRemaining, ["noun", "tag"]);
            if (!complementsResult) {
                continue;
            }
            complements = complementsResult.data;
            wordsRemaining = complementsResult.wordsRemaining;
            addActiveEntitiesFromFragment(complementsResult.fragment);

            /**
             * If the sentence ended with a noun, add that word back to the pool (and the corresponding not if it exists)
             */
            if (wordsRemaining) {
                const complementFragment = complementsResult.fragment;
                const lastComplementWord = complementFragment[complementFragment.length-1];
                if (lastComplementWord.word.behavior.noun) {
                    const maybeNotWord = complementFragment[complementFragment.length-2]?.word.behavior.not ? complementFragment[complementFragment.length-2] : undefined;
                    if (maybeNotWord) {
                        wordsRemaining.unshift(maybeNotWord, lastComplementWord);
                    } else {
                        wordsRemaining.unshift(lastComplementWord);
                    }
                }
            }

            for (const subject of subjects) {
                for (const complement of complements) {

                    const rule = new Rule({
                        preCondition: preCondition,
                        subject: subject,
                        postCondition: postCondition,
                        verb: verb,
                        complement: complement
                    }, this);
                    rules.push(rule);
                }
            }

            for (const entity of activeEntities) {
                this.activeTextEntities.add(entity);
            }
        }

        return rules;
    }


    findRuleStart(words: WordAndEntity[]): IFragmentOutput<undefined> {
        const discardedFragment: WordAndEntity[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const _word = words[i];
            const word = _word.word;
            const behavior = word.behavior;
            let allowed = false;
            for (const allowedWord of Sentence.startingWordTypes) {
                if (behavior[allowedWord]) {
                    allowed = true;
                    break;
                }
            }
            if (!allowed) {
                discardedFragment.push(_word);
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


    parsePreConditionFragment(words: WordAndEntity[]): IFragmentOutput<IRule["preCondition"]> {
        let valid = false;
        let not = false;
        let checkForAnd = false;
        let conditions: RuleNegatableWrapper[] = [];
        const fragment: WordAndEntity[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const _word = words[i];
            const {word, entity} = _word;
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(_word);
                    checkForAnd = false;
                    valid = false;
                    continue;
                } else {
                    break;
                }
            } else {
                if (behavior.not) {
                    fragment.push(_word);
                    not = !not;
                } else if (behavior.prefixCondition) {
                    fragment.push(_word);
                    conditions.push({word: word, not: not, entity: entity});
                    not = false;
                    valid = true;
                    checkForAnd = true;
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


    parseSimpleConjuctionWords(words: WordAndEntity[], allowedTypes: WordType[]): IFragmentOutput<RuleNegatableWrapper[]> {
        let valid = false;
        let checkForAnd = false;
        let not = false;
        const fragment: WordAndEntity[] = [];
        const listWords: RuleNegatableWrapper[] = [];
        let i: number;
        for (i = 0; i < words.length; i++) {
            const _word = words[i];
            const {word, entity} = _word;
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(_word);
                    checkForAnd = false;
                    valid = false;
                    continue;
                } else {
                    break;
                }
            } else {
                if (behavior.not) {
                    not = !not;
                    fragment.push(_word);
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
                    fragment.push(_word);
                    listWords.push({word, not, entity: entity});
                    checkForAnd = true;
                    not = false;
                    valid = true;
                    continue;
                }
                valid = false;
                break;
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


    parsePostConditionFragment(words: WordAndEntity[]): IFragmentOutput<IRule["postCondition"]> {
        let valid = false;
        let not = false;
        let checkForAnd = false;
        let checkForSelector = false;
        let currentCondition: RuleNegatableWrapper | undefined;
        let currentSelectors: RuleNegatableWrapper[] = [];
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

        const fragment: WordAndEntity[] = [];
        for (let i = 0; i < words.length; i++) {
            const _word = words[i];
            const {word, entity} = _word;
            const behavior = word.behavior;
            if (checkForAnd) {
                if (behavior.and) {
                    fragment.push(_word);
                    checkForAnd = false;
                    valid = false;
                    continue;
                } else {
                    conditions.push({...currentCondition!, selector: currentSelectors});
                    break;
                }
            } else if (checkForSelector) {
                if (conditionAllowsWord(currentCondition!.word, word)) {
                    fragment.push(_word);
                    currentSelectors.push({word: word, not: not, entity: entity});
                    not = false;
                    checkForSelector = false;
                    checkForAnd = true;
                    valid = true;
                }
            } else {
                if (behavior.not) {
                    fragment.push(_word);
                    not = !not;
                } else if (behavior.postCondition) {
                    if (currentCondition) {
                        conditions.push({...currentCondition, selector: currentSelectors});
                    }
                    currentCondition = {word: word, not: not, entity: entity};
                    currentSelectors = [];
                    valid = false;
                    not = false;
                    checkForSelector = true;
                    fragment.push(_word);
                    continue;
                } else if (currentCondition && conditionAllowsWord(currentCondition.word, word)) {
                    fragment.push(_word);
                    currentSelectors.push({word: word, not: not, entity: entity});
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


    parseVerbFragment(words: WordAndEntity[]): IFragmentOutput<IRule["verb"]> {
        const _word = words[0];
        if (!_word) {
            return false;
        }
        const {word,entity}  = _word;
        const fragment: WordAndEntity[] = [];
        if (word.behavior.verb) {
            fragment.push(_word);
            return {
                data: {word: word, entity: entity},
                fragment: [_word],
                wordsRemaining: words.slice(fragment.length)
            };
        } else {
            return false;
        }
    }
}

type WordAndEntity = {
    word: Word;
    entity?: Entity;
}

type WordType = keyof WordBehavior;
type IFragmentOutput<T> = {data: T; fragment: WordAndEntity[]; wordsRemaining: WordAndEntity[]} | false;