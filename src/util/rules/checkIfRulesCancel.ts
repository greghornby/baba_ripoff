/** @deprecated - delete */
import type { Entity } from "../../main/Entity.js";
import { Rule } from "../../main/Rule.js";
import { compareNegatableWord } from "./compareNegatableWord.js";

export type CancelledRuleInfo = {
    rule: Rule;
    entities?: {
        preCondtion: Entity[];
        postCondtion: Entity[];
        subject: Entity;
        complement: Entity;
        all: Entity[];
    }
}

/**
 * Returns false if the rules don't cancel.
 * Else returns the cancelled rule
 */
export function checkIfRulesCancel (
    ruleA: Rule,
    ruleB: Rule
): false | CancelledRuleInfo {

    /**
     * @todo
     * Handle examples like, ALL IS NOT Y, X IS Y
     */

    // [NOT] X IS [NOT] A, [NOT] Y IS [NOT] B | [X=Y] [A=B] [A=X]


    const {match: sameSubjectAndNot} = compareNegatableWord(ruleA.rule.subject, ruleB.rule.subject);
    const {match: sameSubject} = compareNegatableWord(ruleA.rule.subject, ruleB.rule.subject, true);
    const {match: sameComplement} = compareNegatableWord(ruleA.rule.complement, ruleB.rule.complement, true); //ignore not with true boolean

    const onePositiveSubjectOneNegativeSubject =
        (ruleA.rule.subject.not && !ruleB.rule.subject.not) ||
        (!ruleA.rule.subject.not && ruleB.rule.subject.not);

    const onePositiveComplementOneNegativeComplement =
        (ruleA.rule.complement.not && !ruleB.rule.complement.not) ||
        (!ruleA.rule.complement.not && ruleB.rule.complement.not);

    if (sameSubject) {

        // [NOT] X IS [NOT] A, [NOT] X IS [NOT] B | [A=B] [A=X]

        if (sameSubjectAndNot) {

            // NOT X IS [NOT] A, NOT X IS [NOT] B | [A=B] [A=X]
            // X IS [NOT] A, X IS [NOT] B | [A=B] [A=X]

            const subjectsArePositive = !ruleA.rule.subject.not && !ruleB.rule.subject.not;

            if (subjectsArePositive) {

                // X IS [NOT] A, X IS [NOT] B | [A=B] [A=X]

                const complementsArePositive = !ruleA.rule.complement.not && !ruleB.rule.complement.not;

                if (complementsArePositive) {

                    // X IS A, X IS B | [A=B] [A=X]

                    // X IS X, and X IS Y cancel
                    for (let i = 0; i < 2; i++) {
                        const rule = i === 0 ? ruleA : ruleB;
                        const otherRule = i === 0 ? ruleB: ruleA;
                        if (
                            rule.rule.subject.word === rule.rule.complement.word
                            && rule.rule.complement.word !== otherRule.rule.complement.word
                        ) {
                            // X IS X, X IS A | A!=X
                            return {
                                rule: otherRule,
                                entities: otherRule.rule.subject.entity && otherRule.rule.complement.entity ? {
                                    preCondtion: [],
                                    postCondtion: [],
                                    subject: otherRule.rule.subject.entity,
                                    complement: otherRule.rule.complement.entity,
                                    all: [
                                        otherRule.rule.subject.entity,
                                        otherRule.rule.complement.entity
                                    ]
                                } : undefined
                            };
                        }
                    }
                }
            }
        }

        // [NOT] X IS [NOT] A, [NOT] X IS [NOT] B | [A=B] X!=A

        //if comparing sentences with different complements, these can't cancel eachother.
        if (!sameComplement) {
            return false;
        }

        // [NOT] X IS [NOT] A, [NOT] X IS [NOT] A | X!=A

        // the complements are the same but must differ by NOT
        if (!onePositiveComplementOneNegativeComplement) {
            return false;
        }

        // [NOT] X IS NOT A, [NOT] X IS A | X!=A

        // X and NOT X don't cover the same objects, so can't cancel
        if (onePositiveSubjectOneNegativeSubject) {
            return false;
        }

        // NOT X IS NOT A, NOT X IS A | X!=A
        // X IS NOT A, X IS A | X!=A

    } else {

        // [NOT] X IS [NOT] A, [NOT] Y IS [NOT] B | X!=Y [A=B] [A=X]

        //if different subjects, must be
        // X IS Z and NOT Y IS NOT Z
        // else cant' cancel
        if (!onePositiveSubjectOneNegativeSubject) {
            return false;
        }

        // NOT X IS [NOT] A, Y IS [NOT] B | X!=Y [A=B] [A=X]

        // NOT X IS Y, and Y IS B cancel -- NOT BABA IS WALL, WALL IS ROCK
        {
            const [positive, negative] = !ruleA.rule.subject.not ? [ruleA, ruleB] : [ruleB, ruleA];
            if (
                negative.rule.complement.word === positive.rule.subject.word
                && positive.rule.subject.word !== positive.rule.complement.word
                && !positive.rule.complement.not && !negative.rule.complement.not
            ) {
                return {
                    rule: positive,
                    entities: positive.rule.subject.entity && positive.rule.complement.entity ? {
                        preCondtion: [],
                        postCondtion: [],
                        subject: positive.rule.subject.entity,
                        complement: positive.rule.complement.entity,
                        all: [
                            positive.rule.subject.entity,
                            positive.rule.complement.entity
                        ]
                    } : undefined
                };
            }
        }

        // NOT X IS [NOT] A, Y IS [NOT] B | X!=Y Y!=A [A=B] [A=X]

        //if comparing sentences with different complements, these can't cancel eachother.
        if (!sameComplement) {
            return false;
        }

        // the complements are the same but must differ by NOT
        if (!onePositiveComplementOneNegativeComplement) {
            return false;
        }
    }

    //if they're both IS NOT Y rules, they can't cancel eachother.
    //or if they're both IS Y rules
    if (
        (ruleA.rule.complement.not && ruleB.rule.complement.not) ||
        (!ruleA.rule.complement.not && !ruleB.rule.complement.not)
    ) {
        return false;
    }

    // console.log("Fallthrough", Sentence.ruleToTextArray(ruleA), Sentence.ruleToTextArray(ruleB));
    // //at this point we know exactly one of the rules is a negative complement, and the other is a positive complement

    const positiveRule = ruleA.rule.complement.not ? ruleB : ruleA;
    return {
        rule: positiveRule,
        entities: positiveRule.rule.subject.entity && positiveRule.rule.complement.entity ? {
            preCondtion: [],
            postCondtion: [],
            subject: positiveRule.rule.subject.entity,
            complement: positiveRule.rule.complement.entity,
            all: [
                positiveRule.rule.subject.entity,
                positiveRule.rule.complement.entity
            ]
        } : undefined
    };
}