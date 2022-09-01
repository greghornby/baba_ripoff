import { IRule, Rule } from "../src/main/Rule.js";
import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";

const $Word = Rule.word;

function generateSentenceRulesTest(fn: jest.It, sentenceText: string, ...expectedRules: IRule[]) {
    return fn(`getRules: ${sentenceText}`, () => {
        const sentence = Sentence.fromString(sentenceText);
        const rules = sentence.getRules();
        expect(rules).toHaveLength(expectedRules.length);
        for (let i = 0; i < expectedRules.length; i++) {
            expect(rules[i].rule).toEqual(expectedRules[i]);
        }
    });
}


describe("X IS YOU with NOT variants", () => {

    generateSentenceRulesTest(test, "baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: {word: words.is},
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest(test, "not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: {word: words.is},
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest(test, "baba is not you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: {word: words.is},
        complement: {word: words.you, not: true}
    });

    generateSentenceRulesTest(test, "not baba is not you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: {word: words.is},
        complement: {word: words.you, not: true}
    });

    generateSentenceRulesTest(test, "not not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: false},
        verb: {word: words.is},
        complement: {word: words.you, not: false}
    });

    generateSentenceRulesTest(test, "not not not baba is you", {
        preCondition: undefined,
        postCondition: undefined,
        subject: {word: words.baba, not: true},
        verb: {word: words.is},
        complement: {word: words.you, not: false}
    });
});


describe("X [Post Condition] IS YOU", () => {

    generateSentenceRulesTest(test, "baba facing wall and leaf is you", {
        preCondition: undefined,
        postCondition: [{...$Word(words.facing), selector: [$Word(words.wall), $Word(words.leaf)]}],
        subject: $Word(words.baba),
        verb: {word: words.is},
        complement: $Word(words.you)
    });


    generateSentenceRulesTest(test, "baba facing wall and on leaf is you", {
        preCondition: undefined,
        subject: $Word(words.baba),
        postCondition: [
            {...$Word(words.facing), selector: [$Word(words.wall)]},
            {...$Word(words.on), selector: [$Word(words.leaf)]}
        ],
        verb: {word: words.is},
        complement: $Word(words.you)
    });


    generateSentenceRulesTest(test, "baba facing wall and leaf is you", {
        preCondition: undefined,
        subject: $Word(words.baba),
        postCondition: [
            {...$Word(words.facing), selector: [$Word(words.wall), $Word(words.leaf)]},
        ],
        verb: {word: words.is},
        complement: $Word(words.you)
    });


    //this rule should break and just become "leaf on leaf is you"
    generateSentenceRulesTest(test.skip, "baba facing wall and leaf on leaf is you", {
        preCondition: undefined,
        subject: $Word(words.leaf),
        postCondition: [{...$Word(words.on), selector: [$Word(words.leaf)]}],
        verb: {word: words.is},
        complement: $Word(words.you)
    });
});


describe("[Pre Condition] X IS YOU", () => {

    generateSentenceRulesTest(test, "lonely baba is you", {
        preCondition: [$Word(words.lonely)],
        postCondition: undefined,
        subject: $Word(words.baba),
        verb: {word: words.is},
        complement: $Word(words.you)
    });

    generateSentenceRulesTest(test, "lonely and powered baba is you", {
        preCondition: [$Word(words.lonely), $Word(words.powered)],
        postCondition: undefined,
        subject: $Word(words.baba),
        verb: {word: words.is},
        complement: $Word(words.you)
    });
});


test("Broken Sentences no rules", () => {

    const sentencesArray: string[] = [
        "wall and",
        "rock is not",
        "wall and is you",
        "lonely and powered baba facing wall and is you"
    ];

    for (const text of sentencesArray) {
        console.log(`Checking broken: "${text}"`);
        const sentence = Sentence.fromString(text);
        const rules = sentence.getRules();
        expect(rules).toHaveLength(0);
        console.log(`Checked!`);
    }
})