import { Rule, RuleNegatableWrapper } from "../../main/Rule.js";
import { Word } from "../../main/Word.js";
import { compareNegatableWord } from "./compareNegatableWord.js";

export const notRuleIsMoreSpecific = (
    rule: Rule,
    notRule: Rule
): boolean => {
    const {preCondition, postCondition} = rule.rule;
    const {preCondition: notPreCondition, postCondition: notPostCondition} = notRule.rule;


    preCheck:
    {
        const basicCheck = basicCheckIsMoreSpecific(preCondition, notPreCondition);
        if (basicCheck) {
            return true;
        }
        if (!preCondition || !notPreCondition) {
            break preCheck;
        }
        const list = [...preCondition].sort((a,b) => wordSorter(a.word, b.word));
        const notList = [...notPreCondition].sort((a,b) => wordSorter(a.word, b.word));
        for (let i = 0; i < notList.length; i++) {
            const item = list[i];
            const notItem = notList[i];
            if (!compareNegatableWord(item, notItem)) {
                return true;
            }
        }
    }


    postCheck:
    {
        const basicCheck = basicCheckIsMoreSpecific(postCondition, notPostCondition);
        if (basicCheck) {
            return true;
        }
        if (!postCondition || !notPostCondition) {
            break postCheck;
        }
        const list = [...postCondition].sort((a,b) => wordSorter(a.word, b.word));
        const notList = [...notPostCondition].sort((a,b) => wordSorter(a.word, b.word));
        for (let i = 0; i < notList.length; i++) {
            const item = list[i];
            const notItem = notList[i];
            if (!compareNegatableWord(item, notItem)) {
                return true;
            }
            if (basicCheckIsMoreSpecific(item.selector, notItem.selector)) {
                return true;
            }
            const selector = [...item.selector].sort((a,b) => wordSorter(a.word, b.word));
            const notSelector = [...notItem.selector].sort((a,b) => wordSorter(a.word, b.word));
            for (let s = 0; s < notSelector.length; s++) {
                const item = selector[s];
                const notItem = notSelector[s];
                if (!compareNegatableWord(item, notItem)) {
                    return true;
                }
            }
        }
    }

    return false;
}


const basicCheckIsMoreSpecific = (
    fragment: RuleNegatableWrapper[] | undefined,
    notFragment: RuleNegatableWrapper[] | undefined
): boolean => {
    if (!fragment && !notFragment) {
        return false;
    }
    else if (fragment && !notFragment) {
        return false;
    }
    else if (!fragment && notFragment) {
        return true;
    }
    else if (fragment!.length < notFragment!.length) {
        return true;
    } else {
        return false;
    }
}


const wordSorter = (a: Word, b: Word) => {
    return a._string.localeCompare(b._string);
}