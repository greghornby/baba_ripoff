import { Sentence } from "../src/classes/Sentence.js";


test("These Sentences should be invalid", () => {

    const texts = [
        "rock is is push"
    ];

    for (const text of texts) {
        const sentence = Sentence.fromString(text);
        const rules = sentence.getRules();
        expect(rules.length).toBe(0);
    }
});