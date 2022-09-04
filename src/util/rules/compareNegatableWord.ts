import { RuleNegatableWrapper } from "../../main/Rule.js"

export const compareNegatableWord = (
    wordA: RuleNegatableWrapper,
    wordB: RuleNegatableWrapper,
    ignoreNot?: boolean
): {word: boolean; match: boolean} => {
    let r = {word: false, match: false};
    if (wordA.word !== wordB.word) {
        return r;
    }
    r.word = true;
    r.match = ignoreNot ? true : wordA.not === wordB.not;
    return r;
};