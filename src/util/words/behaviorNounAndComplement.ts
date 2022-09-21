import { WordBehavior } from "../../classes/Word.js";

export const behaviorNounBoth = (nounSelector: ({} & WordBehavior["noun"])["subject"]): WordBehavior["noun"] => {
    return {
        subject: nounSelector,
        compliment: nounSelector
    };
}