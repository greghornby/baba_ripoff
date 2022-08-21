import { Facing } from "../types/Facing.js";

export interface Interaction {
    interaction: InteractionMove | InteractionWait;
}

export interface InteractionMove {
    type: "move";
    direction: Facing;
}

export interface InteractionWait {
    type: "wait";
}