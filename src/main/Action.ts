import { Facing } from "../types/Facing.js";
import { Construct } from "./Construct.js";
import { Entity } from "./Entity.js";
import objectHash from "object-hash";

export class Action {
    public hash: string;
    public debug: any;
    constructor(public data: MovementAction | DestroyEntityAction | CreateEntityAction) {
        this.hash = this.calculateHash();
        this.setDebugData();
    }


    public calculateHash(): string {
        return objectHash(this._getNonCircularDataToHash());
    }


    public _getNonCircularDataToHash(): Record<string, string | number> {
        if (this.data.type === "movement") {
            const {entity, ...obj} = this.data;
            return {...obj};
        } else {
            return {};
        }
    }


    public setDebugData() {
        const data = this.data;
        if (data.type === "movement") {
            this.debug = {
                entityId: data.entity.id,
                entityName: data.entity.name
            };
        } else {
            return;
        }
    }

    toJSON(): Record<string, string | number> {
        return {
            ...this._getNonCircularDataToHash(),
            debug: this.debug
        };
    }
}

export interface MovementAction {
    type: "movement";
    entity: Entity;
    entityId: number;
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