import { Sentence } from "../src/main/Sentence.js"
import { notRuleIsMoreSpecific } from "../src/util/notRuleIsMoreSpecific.js";

const cancels = false;
const notCancels = true;

test("notRuleIsMoreSpecific", () => {

    const sentences: [textA: string, textB: string, expectedResult: boolean][] = [
        ["text is push", "rock is not push", notCancels],
        ["baba is you", "baba is not you", cancels],
        ["lonely baba is you", "lonely baba is not you", cancels],
        ["baba is you", "lonely baba is not you", notCancels],
        ["baba facing wall is you", "baba facing wall is not you", cancels],
        ["baba is you", "baba facing wall is not you", notCancels],
        ["baba facing wall is you", "baba facing wall and near wall is not you", notCancels],
        ["lonely baba is you", "lonely and powered baba is not you", notCancels],
        ["lonely and powered baba is you", "lonely baba is not you", cancels],
        ["baba facing wall and near wall is you", "baba facing wall is not you", cancels],

        ["baba facing wall and leaf is you", "baba facing wall and leaf is not you", cancels],
        ["baba facing wall and leaf is you", "baba facing wall is not you", cancels],
        ["baba facing wall is you", "baba facing wall and leaf is not you", notCancels],

        //match
        [
            "lonely and powered baba facing wall and leaf and on wall and leaf is you",
            "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
            cancels
        ],

        //more specific preCondition
        [
            "lonely baba facing wall and leaf and on wall and leaf is you",
            "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
            notCancels
        ],

        //less specific preCondition
        [
            "lonely and powered baba facing wall and leaf and on wall and leaf is you",
            "lonely baba facing wall and leaf and on wall and leaf is not you",
            cancels
        ],

        //more specific postCondition (number of conditions)
        [
            "lonely and powered baba facing wall and leaf is you",
            "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
            notCancels
        ],

        //less specific postCondition (number of conditions)
        [
            "lonely and powered baba facing wall and leaf and on wall and leaf is you",
            "lonely and powered baba facing wall and leaf is not you",
            cancels
        ],

        //more specific postCondition (number of selectors)
        [
            "lonely and powered baba facing wall and leaf and on wall is you",
            "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
            notCancels
        ],

        //less specific postCondition (number of selectors)
        [
            "lonely and powered baba facing wall and leaf and on wall and leaf is you",
            "lonely and powered baba facing wall and leaf and on wall is not you",
            cancels
        ],

        //more specific postCondition (number of conditions and selectors)
        [
            "lonely and powered baba facing wall is you",
            "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
            notCancels
        ],

        //less specific postCondition (number of conditions and selectors)
        [
            "lonely and powered baba facing wall and leaf and on wall and leaf is you",
            "lonely and powered baba facing wall is not you",
            cancels
        ]
    ];

    for (const [textA, textB, expectedResult] of sentences) {
        const ruleA = Sentence.fromString(textA).getRules()[0];
        const ruleB = Sentence.fromString(textB).getRules()[0];

        expect(ruleA).toBeDefined();
        expect(ruleB).toBeDefined();

        const result = notRuleIsMoreSpecific(ruleA, ruleB);

        console.log(textA, "|", textB, "=", result);

        expect(result).toEqual(expectedResult);
    }
})