import { AppEventInterface } from "../../app/AppEventInterface.js";
import { Interaction } from "../../main/Interaction.js";
import { Direction } from "../../types/Direction.js";

export function getInteractionFromKeyboard(event: AppEventInterface.Keyboard): Interaction | undefined {
    const key = event.key;
    let interactionType: Interaction["interaction"] | undefined;

    switch (key) {
        case "w":
        case "ArrowUp":
            interactionType = {type: "move", direction: Direction.up};
            break;
        case "a":
        case "ArrowLeft":
            interactionType = {type: "move", direction: Direction.left};
            break;
        case "d":
        case "ArrowRight":
            interactionType = {type: "move", direction: Direction.right};
            break;
        case "s":
        case "ArrowDown":
            interactionType = {type: "move", direction: Direction.down};
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
        case "p":
            interactionType = {type: "pause"};
            break;
    }

    if (!interactionType) {
        return;
    }

    return {interaction: interactionType};
}