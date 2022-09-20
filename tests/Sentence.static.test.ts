import { Rule } from "../src/classes/Rule.js";
import { Sentence } from "../src/classes/Sentence.js";
import { words } from "../src/data/words.js";


const $Word = Rule.word;

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
        preCondition: [
            $Word(words.lonely),
            $Word.not(words.powered),
        ],
        postCondition: [
            {...$Word(words.facing), selector: [$Word(words.wall)]},
            {...$Word.not(words.near), selector: [$Word(words.leaf)]},
        ],
        subject: $Word.not(words.baba),
        verb: $Word(words.is),
        complement: $Word.not(words.you)
    });

    const getSimplifiedText = Sentence.ruleToTextArray(rule);

    const expectedText = `lonely and not powered not baba facing wall and not near leaf is not you`;

    expect(getSimplifiedText.join(" ")).toBe(expectedText);
});