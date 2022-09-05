import { AppEventInterface } from "../../app/AppEventInterface.js";
import { Interaction } from "../../main/Interaction.js";

export function getInteractionFromDoubleTap(event: AppEventInterface.DoubleTap): Interaction {
    return {interaction: {type: "undo"}};
}