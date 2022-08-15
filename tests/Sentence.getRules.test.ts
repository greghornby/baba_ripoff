import { IRule } from "../src/main/Rule.js";
import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";


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
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: words.is,
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest("not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: words.is,
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest("baba is not you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: words.is,
        complement: {word: words.you, not: true}
    });

    generateSentenceRulesTest("not baba is not you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: words.is,
        complement: {word: words.you, not: true}
    });

    generateSentenceRulesTest("not not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: words.is,
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest("not not not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: words.is,
        complement: {word: words.you, not: false}
    });
});