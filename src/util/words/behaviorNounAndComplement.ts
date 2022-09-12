import { WordBehavior } from "../../main/Word.js";

export const behaviorNoun = (nounSelector: ({} & WordBehavior["noun"])["subject"]): WordBehavior["noun"] => {
    return {
        subject: nounSelector,
        compliment: nounSelector
    };
}