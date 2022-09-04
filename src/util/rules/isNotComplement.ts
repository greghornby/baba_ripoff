import { Rule } from "../../main/Rule.js"

export const isNotComplement = (rule: Rule): boolean => {
    return rule.rule.complement.not;
}