import { Facing } from "../types/Facing.js";
import { Construct } from "./Construct.js";
import { Entity } from "./Entity.js";

export class Action {
    constructor(public data: MovementAction | DestroyEntityAction | CreateEntityAction) {}
}

export interface MovementAction {
    type: "movement";
    entity: Entity;
    startDirection: Facing;
    endDirection: Facing;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}


export interface DestroyEntityAction {
    type: "destroy";
    construct: Construct;
    x: number;
    y: number;
}


export interface CreateEntityAction {
    type: "create";
    construct: Construct;
    x: number;
    y: number;
}