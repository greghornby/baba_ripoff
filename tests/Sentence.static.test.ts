import { Rule } from "../src/main/Rule.js";
import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";

test("fromString: baba is you", () => {
    const sentence = Sentence.fromString("baba is you");
    expect(sentence.words).toHaveLength(3);
    expect(sentence.words[0]).toBe(words.baba);
    expect(sentence.words[1]).toBe(words.is);
    expect(sentence.words[2]).toBe(words.you);
});

test("sentece to asSimplifiedSentence", () => {
    const sentenceToSimplified: Record<string, string> = {
        "baba is you": "baba is you",
        "not baba is you": "not baba is you",
        "not not baba is you": "baba is you",
    };

    for (const [sentenceText, expectedSimplifiedText] of Object.entries(sentenceToSimplified)) {
        const sentence = Sentence.fromString(sentenceText);
        const rule = sentence.getRules()[0];
        const getSimplifiedText = Sentence.ruleToTextArray(rule);
        expect(getSimplifiedText.join(" ")).toBe(expectedSimplifiedText);
    }
});


test("complex rule to asSimplifiedSentence", () => {

    const rule = new Rule({
        selector: {
            preCondition: [
                {word: words.lonely, not: false},
                {word: words.idle, not: true},
            ],
            postCondition: [
                {word: words.facing, not: false, selector: [words.wall]},
                {word: words.near, not: true, selector: [words.leaf]},
            ],
            nouns: [
                {word: words.baba, not: false},
                {word: words.leaf, not: true}
            ],
        },
        verb: {
            verb: words.is
        },
        output: {
            outputs: [
                {word: words.leaf, not: true},
                {word: words.you, not: false}
            ]
        }
    });

    const getSimplifiedText = Sentence.ruleToTextArray(rule);

    const expectedText = `not idle and lonely baba and not leaf facing wall and not near leaf is not leaf and you`;

    expect(getSimplifiedText.join(" ")).toBe(expectedText);
});