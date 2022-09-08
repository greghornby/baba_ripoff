import { Rule } from "../../main/Rule.js";

export const rulesCancelMap: Record<string, string> = {
    "X IS NOT A": "X IS A", // baba is rock, baba is not rock
    "NOT X IS NOT A": "Y IS A", //baba is rock, not wall is not rock
    "X IS X": "X IS B", //baba is baba, baba is rock
    "X IS NOT X": "X IS X", //baba is baba, baba is not baba
    "NOT X IS Y": "Y IS B", //not baba is wall, wall is rock,
    "ALL IS NOT A": "Y IS A", //all is not rock, baba is rock
};

export function rulesCancel(ruleX: Rule, ruleY: Rule): Rule | undefined {

    //if one is tag, both must be tags to cancel
    if (
        (ruleX.rule.complement.word.behavior.tag && !ruleY.rule.complement.word.behavior.tag) ||
        (!ruleX.rule.complement.word.behavior.tag && ruleY.rule.complement.word.behavior.tag)
    ) {
        return undefined;
    }

    for (let i = 0; i < 2; i++) {
        const x = i === 0 ? ruleX : ruleY;
        const y = i === 0 ? ruleY : ruleX;

        const [patternX, patternY] = convertRulesToPattern(x, y);

        const cancelledPattern = rulesCancelMap[patternX];
        if (cancelledPattern && patternY === cancelledPattern) {
            return y;
        }
    }
    return undefined;
}

const allString = "all";
export function convertRulesToPattern(ruleX: Rule, ruleY: Rule): [string, string] {

    const _xComplex = (ruleX.rule.preCondition || ruleX.rule.postCondition) ? "X COMPLEX" : undefined;
    const _yComplex = (ruleY.rule.preCondition || ruleY.rule.postCondition) ? "Y COMPLEX" : undefined;

    if (_xComplex && _yComplex) {
        return [_xComplex, _yComplex];
    }

    const rX = ruleX.rule;
    const rY = ruleY.rule;

    const _xString = rX.subject.word._string === allString ? "ALL" : "X";
    const _yString = rY.subject.word._string === allString ? "ALL" : "Y";
    const _aString = rX.complement.word._string === allString ? "ALL": "A";
    const _bString = rY.complement.word._string === allString ? "ALL": "B";

    const X = _xString;
    const Y = rY.subject.word === rX.subject.word ? X : _yString;
    const A = rX.complement.word === rX.subject.word ? X : rX.complement.word === rY.subject.word ? Y : _aString;
    const B = rY.complement.word === rX.subject.word ? "X": rY.complement.word === rY.subject.word ? Y : rY.complement.word === rX.complement.word ? A : _bString;

    return [
        _xComplex ?? `${rX.subject.not ? "NOT " : ""}${X} IS ${rX.complement.not ? "NOT " : ""}${A}`,
        _yComplex ?? `${rY.subject.not ? "NOT " : ""}${Y} IS ${rY.complement.not ? "NOT " : ""}${B}`
    ];
}