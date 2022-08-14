import { IRule } from "../src/main/Rule.js";
import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";

test("fromString: baba is you", () => {
    const sentence = Sentence.fromString("baba is you");
    expect(sentence.words).toHaveLength(3);
    expect(sentence.words[0]).toBe(words.baba);
    expect(sentence.words[1]).toBe(words.is);
    expect(sentence.words[2]).toBe(words.you);
});


function generateSentenceRulesTest(sentenceText: string, ...expectedRules: IRule[]) {
    return test(`getRules: ${sentenceText}`, () => {
        const sentence = Sentence.fromString(sentenceText);
        const rules = sentence.getRules();
        expect(rules).toHaveLength(expectedRules.length);
        for (let i = 0; i < expectedRules.length; i++) {
            expect(rules[i].rule).toEqual(expectedRules[i]);
        }
    });
}


describe("X IS YOU with NOT variants", () => {

    generateSentenceRulesTest("baba is you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: false}]
        },
        verb: {verb: {word: words.is, not: false}},
        output: {outputs: [{word: words.you, not: false}]}
    });

    generateSentenceRulesTest("not baba is you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: true}]
        },
        verb: {verb: {word: words.is, not: false}},
        output: {outputs: [{word: words.you, not: false}]}
    });

    generateSentenceRulesTest("baba is not you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: false}]
        },
        verb: {verb: {word: words.is, not: true}},
        output: {outputs: [{word: words.you, not: false}]}
    });

    generateSentenceRulesTest("not baba is not you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: true}]
        },
        verb: {verb: {word: words.is, not: true}},
        output: {outputs: [{word: words.you, not: false}]}
    });

    generateSentenceRulesTest("not not baba is you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: false}]
        },
        verb: {verb: {word: words.is, not: false}},
        output: {outputs: [{word: words.you, not: false}]}
    });

    generateSentenceRulesTest("not not not baba is you", {
        selector: {
            preCondition: undefined,
            postCondition: undefined,
            nouns: [{word: words.baba, not: true}]
        },
        verb: {verb: {word: words.is, not: false}},
        output: {outputs: [{word: words.you, not: false}]}
    });
});