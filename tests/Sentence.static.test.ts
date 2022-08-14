import { Sentence } from "../src/main/Sentence.js";
import { words } from "../src/objects/words.js";

test("fromString: baba is you", () => {
    const sentence = Sentence.fromString("baba is you");
    expect(sentence.words).toHaveLength(3);
    expect(sentence.words[0]).toBe(words.baba);
    expect(sentence.words[1]).toBe(words.is);
    expect(sentence.words[2]).toBe(words.you);
});

test("asSimplifiedSentence", () => {
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