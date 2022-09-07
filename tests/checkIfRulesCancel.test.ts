import { Sentence } from "../src/main/Sentence.js";
import { checkIfRulesCancel } from "../src/util/rules/checkIfRulesCancel.js";

const cancels = true;
const notCancels = false;

test("notRuleIsMoreSpecific", () => {

    type Item = [textA: string, textB: string, expectedResult: boolean];

    type T = Item | (() => Item);

    const sentences: T[] = [
        // ["baba is you", "baba is not you", cancels],
        // ["lonely baba is you", "lonely baba is not you", cancels],
        // ["baba is you", "lonely baba is not you", notCancels],
        // ["baba facing wall is you", "baba facing wall is not you", cancels],
        // ["baba is you", "baba facing wall is not you", notCancels],
        // ["baba facing wall is you", "baba facing wall and near wall is not you", notCancels],
        // ["lonely baba is you", "lonely and powered baba is not you", notCancels],
        // ["lonely and powered baba is you", "lonely baba is not you", cancels],
        // ["baba facing wall and near wall is you", "baba facing wall is not you", cancels],

        // ["baba facing wall and leaf is you", "baba facing wall and leaf is not you", cancels],
        // ["baba facing wall and leaf is you", "baba facing wall is not you", cancels],
        // ["baba facing wall is you", "baba facing wall and leaf is not you", notCancels],

        // //match
        // [
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is you",
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
        //     cancels
        // ],

        // //more specific preCondition
        // [
        //     "lonely baba facing wall and leaf and on wall and leaf is you",
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
        //     notCancels
        // ],

        // //less specific preCondition
        // [
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is you",
        //     "lonely baba facing wall and leaf and on wall and leaf is not you",
        //     cancels
        // ],

        // //more specific postCondition (number of conditions)
        // [
        //     "lonely and powered baba facing wall and leaf is you",
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
        //     notCancels
        // ],

        // //less specific postCondition (number of conditions)
        // [
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is you",
        //     "lonely and powered baba facing wall and leaf is not you",
        //     cancels
        // ],

        // //more specific postCondition (number of selectors)
        // [
        //     "lonely and powered baba facing wall and leaf and on wall is you",
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
        //     notCancels
        // ],

        // //less specific postCondition (number of selectors)
        // [
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is you",
        //     "lonely and powered baba facing wall and leaf and on wall is not you",
        //     cancels
        // ],

        // //more specific postCondition (number of conditions and selectors)
        // [
        //     "lonely and powered baba facing wall is you",
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is not you",
        //     notCancels
        // ],

        // //less specific postCondition (number of conditions and selectors)
        // [
        //     "lonely and powered baba facing wall and leaf and on wall and leaf is you",
        //     "lonely and powered baba facing wall is not you",
        //     cancels
        // ],

        ["baba is rock", "baba is not rock", cancels],
        ["baba is rock", "not wall is not rock", cancels],
        ["baba is baba", "baba is rock", cancels],
        ["not baba is wall", "wall is rock", cancels],
        ["not baba is baba", "rock is not baba", notCancels],
        ["not baba is leaf", "rock is not leaf", notCancels],
        ["baba is not baba", "baba is baba", cancels],
        ["baba is rock", "not baba is not rock", notCancels],
        ["baba is rock", "baba is leaf", notCancels],
        ["baba is not rock", "baba is not leaf", notCancels],
        ["not baba is baba", "baba is rock", notCancels],
        ["baba is not leaf", "baba is rock", notCancels],
        ["baba is not baba", "baba is rock", notCancels],
        ["baba is not baba", "rock is baba", notCancels],
        ["baba is not baba", "rock is leaf", notCancels],
        ["baba is baba", "baba is not rock", notCancels],
    ];

    for (const item of sentences) {
        let textA: Item[0];
        let textB: Item[1];
        let expectedResult: Item[2];
        if (Array.isArray(item)) {
            [textA, textB, expectedResult] = item;
        } else {
            [textA, textB, expectedResult] = item();
        }
        const ruleA = Sentence.fromString(textA).getRules()[0];
        const ruleB = Sentence.fromString(textB).getRules()[0];

        expect(ruleA).toBeDefined();
        expect(ruleB).toBeDefined();

        const result = !!checkIfRulesCancel(ruleA, ruleB);

        console.log(textA, "|", textB, "=", result, ", expected:", expectedResult, ", pass: ", result === expectedResult);

        expect(result).toEqual(expectedResult);
    }
})