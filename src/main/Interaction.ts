import { Direction } from "../types/Direction.js";

export interface Interaction {
    interaction: InteractionMove | InteractionWait | InteractionUndo | InteractionRestart | InteractionPause;
}

export interface InteractionMove {
    type: "move";
    direction: Direction;
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

export interface InteractionPause {
    type: "pause";
}