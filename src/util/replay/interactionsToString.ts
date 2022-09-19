import { Interaction } from "../../types/Interaction.js";
import { interactionCharMap } from "./interactionCharMap.js";

export function interactionsToString(interactions: Interaction[]): string {
    return interactions.map(i => interactionCharMap(i)).join("");
}