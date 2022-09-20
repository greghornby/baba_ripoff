import { Sentence } from "../src/classes/Sentence.js";
import { convertRulesToPattern } from "../src/util/rules/rulesCancel.js";

test("convertRulesToPattern", () => {

    const sentences: [string, string, string, string][] = [

        /** All combos */
        ["baba is rock", "leaf is wall", "X IS A", "Y IS B"],
        ["baba is rock", "leaf is leaf", "X IS A", "Y IS Y"],
        ["baba is rock", "leaf is baba", "X IS A", "Y IS X"],

        ["baba is rock", "baba is wall", "X IS A", "X IS B"],
        // ["", "", "X IS A", "X IS Y"], impossible combination
        ["baba is rock", "baba is baba", "X IS A", "X IS X"],

        ["baba is baba", "rock is leaf", "X IS X", "Y IS B"],
        ["baba is baba", "rock is rock", "X IS X", "Y IS Y"],
        ["baba is baba", "rock is baba", "X IS X", "Y IS X"],

        ["baba is baba", "baba is leaf", "X IS X", "X IS B"],
        // ["", "", "X IS X", "X IS Y"], impossible combination
        ["baba is baba", "baba is baba", "X IS X", "X IS X"],

        ["baba is wall", "wall is rock", "X IS Y", "Y IS B"],
        ["baba is rock", "rock is rock", "X IS Y", "Y IS Y"],
        ["baba is rock", "rock is baba", "X IS Y", "Y IS X"],

        // ["", "", "X IS Y", "X IS B"], impossible combination
        // ["", "", "X IS Y", "X IS Y"], impossible combination
        // ["", "", "X IS Y", "X IS X"], impossible combination

        /** ALL tests */
        ["all is rock", "flag is not rock", "ALL IS A", "Y IS NOT A"],

        /** Complex tests */
        ["baba facing wall is rock", "leaf is flag", "X COMPLEX", "Y IS B"],
        ["leaf is flag", "baba facing wall is rock", "X IS A", "Y COMPLEX"],
        ["baba facing wall is rock", "leaf on flag is wall", "X COMPLEX", "Y COMPLEX"],

        /** Other tests */
        ["baba is rock", "baba is not rock", "X IS A", "X IS NOT A"],
        ["not baba is not rock", "not leaf is not wall", "NOT X IS NOT A", "NOT Y IS NOT B"],
        ["not baba is not rock", "not leaf is not rock", "NOT X IS NOT A", "NOT Y IS NOT A"],
    ];

    for (const arr of sentences) {
        const [textA,textB,expectedA, expectedB] = arr;
        const ruleA = Sentence.fromString(textA).getRules()[0];
        const ruleB = Sentence.fromString(textB).getRules()[0];

        const [patternA, patternB] = convertRulesToPattern(ruleA, ruleB);

        console.log(`${patternA}, ${patternB}`);

        expect(patternA).toEqual(expectedA);
        expect(patternB).toEqual(expectedB);
    }
});