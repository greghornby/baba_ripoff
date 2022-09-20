import conditions from "./words/wordConditions.js";
import nouns from "./words/wordNouns.js";
import special from "./words/wordSpecials.js";
import tags from "./words/wordTags.js";
import verbs from "./words/wordVerbs.js";

export const words = {
    ...special,
    ...nouns,
    ...verbs,
    ...tags,
    ...conditions,
}