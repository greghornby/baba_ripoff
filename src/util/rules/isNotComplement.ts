import { Rule } from "../../object_classes/Rule.js";

export const isNotComplement = (rule: Rule): boolean => {
    return rule.rule.complement.not;
}