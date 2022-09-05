import { AppEventInterface } from "../../app/AppEventInterface.js";
import { Interaction } from "../../main/Interaction.js";

export function getInteractionFromDoubleTap(event: AppEventInterface.DoubleTap): Interaction | undefined {
    if (event.fingerCount === 1) {
        return {interaction: {type: "undo"}};
    } else if (event.fingerCount === 2) {
        return {interaction: {type: "restart"}};
    }
}