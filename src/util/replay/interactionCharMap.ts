import { Interaction } from "../../main/Interaction.js";
import { Direction } from "../../types/Direction.js";

export function interactionCharMap(interactionOrChar: Interaction): string;
export function interactionCharMap(interactionOrChar: string): Interaction | undefined;
export function interactionCharMap(interactionOrChar: Interaction | string): string | Interaction | undefined {
    if (typeof interactionOrChar === "string") {
        switch (interactionOrChar) {
            case "-": return <Interaction>{interaction: {type: "wait"}};
            case "u": return <Interaction>{interaction: {type: "move", direction: Direction.up}};
            case "d": return <Interaction>{interaction: {type: "move", direction: Direction.down}};
            case "l": return <Interaction>{interaction: {type: "move", direction: Direction.left}};
            case "r": return <Interaction>{interaction: {type: "move", direction: Direction.right}};
            default: return undefined;
        }
    } else {
        const interaction = interactionOrChar;
        switch (interaction.interaction.type) {
            case "wait": return "-";
            case "move":
                switch(interaction.interaction.direction) {
                    case Direction.up: return "u";
                    case Direction.down: return "d";
                    case Direction.left: return "l";
                    case Direction.right: return "r";
                }
            default:
                return "";
        }
    }
}