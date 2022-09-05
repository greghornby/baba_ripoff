import { Facing } from "../types/Facing.js";

export interface Interaction {
    interaction: InteractionMove | InteractionWait | InteractionUndo | InteractionRestart;
}

export interface InteractionMove {
    type: "move";
    direction: Facing;
}

export interface InteractionWait {
    type: "wait";
}

export interface InteractionUndo {
    type: "undo";
}

export interface InteractionRestart {
    type: "restart";
}