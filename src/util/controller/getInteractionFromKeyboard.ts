import { AppEventInterface } from "../../app/AppEventInterface.js";
import { Interaction } from "../../main/Interaction.js";
import { Facing } from "../../types/Facing.js";

export function getInteractionFromKeyboard(event: AppEventInterface.Keyboard): Interaction | undefined {
    const key = event.key;
    let interactionType: Interaction["interaction"] | undefined;

    switch (key) {
        case "w":
        case "ArrowUp":
            interactionType = {type: "move", direction: Facing.up};
            break;
        case "a":
        case "ArrowLeft":
            interactionType = {type: "move", direction: Facing.left};
            break;
        case "d":
        case "ArrowRight":
            interactionType = {type: "move", direction: Facing.right};
            break;
        case "s":
        case "ArrowDown":
            interactionType = {type: "move", direction: Facing.down};
            break;
        case " ":
            interactionType = {type: "wait"};
            break;
        case "z":
            interactionType = {type: "undo"};
            break;
        case "t":
            interactionType = {type: "restart"};
            break;
    }

    if (!interactionType) {
        return;
    }

    return {interaction: interactionType};
}