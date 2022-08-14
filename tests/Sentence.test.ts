import { IRule } from "../src/main/Rule.js";
import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";

test("find from string: baba is you", () => {

    const sentence = Sentence.fromString("baba is you");
    expect(sentence.words).toHaveLength(3);
    expect(sentence.words[0]).toBe(words.baba);
    expect(sentence.words[1]).toBe(words.is);
    expect(sentence.words[2]).toBe(words.you);
});


test("sentence: baba is you", () => {

    const sentence = Sentence.fromString("baba is you");

    const rules = sentence.getRules();
    expect(rules).toHaveLength(1);

    const rule = rules[0].rule;

    const expectedRule: IRule = {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: false}]
        },
        verb: {verb: {word: words.is, not: false}},
        output: {outputs: [{word: words.you, not: false}]}
    }

    expect(rule).toEqual(expectedRule);
});


test("sentence: baba is not you", () => {

    const sentence = Sentence.fromString("baba is not you");

    const rules = sentence.getRules();
    expect(rules).toHaveLength(1);

    const rule = rules[0].rule;

    const expectedRule: IRule = {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: false}]
        },
        verb: {verb: {word: words.is, not: true}},
        output: {outputs: [{word: words.you, not: false}]}
    }

    expect(rule).toEqual(expectedRule);
});