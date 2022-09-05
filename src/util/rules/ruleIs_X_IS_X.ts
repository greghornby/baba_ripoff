import { Rule } from "../../main/Rule.js";

export const ruleIs_X_IS_X = (rule: Rule): boolean => {
    return !rule.rule.subject.not && !rule.rule.complement.not && rule.rule.subject.word === rule.rule.complement.word;
}