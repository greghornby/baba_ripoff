import { WordBehavior } from "../../classes/Word.js";

export const behaviorNoun = (nounSelector: ({} & WordBehavior["noun"])["subject"]): WordBehavior["noun"] => {
    return {
        subject: nounSelector,
        compliment: nounSelector
    };
}