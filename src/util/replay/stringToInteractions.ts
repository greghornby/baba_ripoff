import { Interaction } from "../../main/Interaction.js";
import { interactionCharMap } from "./interactionCharMap.js";

export function stringToInteractions(text: string): Interaction[] {
    return text.split("").map(c => interactionCharMap(c)).filter(i => i) as Interaction[];
}