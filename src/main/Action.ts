import objectHash from "object-hash";
import { Direction } from "../types/Direction.js";
import { Construct } from "./Construct.js";

export class Action {
    public hash: string;
    public debug: any;
    constructor(
        public step: number,
        public data: MovementAction | FacingAction | DestroyEntityAction | CreateEntityAction | SwapOutEntityAction | SwapInEntityAction,
        public inputDebug?: any
    ) {
        this.hash = this.calculateHash();
        this.setDebugData();
    }


    public calculateHash(): string {
        return `type:${this.data.type}:hash:` + objectHash(this._getNonCircularDataToHash());
    }


    public _getNonCircularDataToHash(): Record<string, string | number> {
        switch (this.data.type) {
            case "movement":
            case "facing":
                return {...this.data};
            case "create":
            case "destroy":
            case "swapin":
            case "swapout":
                return {
                    type: this.data.type,
                    entityId: this.data.entityId,
                    construct: this.data.construct.id,
                    x: this.data.x,
                    y: this.data.y,
                };
        }
    }


    public setDebugData() {
        const data = this.data;
        if (data.type === "movement") {
            this.debug = {
                entityId: data.entityId
            };
        }
        else if (data.type === "swapin" || data.type === "swapout") {
            this.debug = {
                constructName: data.construct.associatedWord()._string
            };
        } else {
            this.debug = {};
        }
        Object.assign(this.debug, this.inputDebug);
    }

    toJSON(): Record<string, string | number> {
        return {
            type: this.data.type,
            ...this._getNonCircularDataToHash(),
            hash: this.hash,
            debug: this.debug
        };
    }
}

export interface MovementAction {
    type: "movement";
    entityId: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}


export interface FacingAction {
    type: "facing";
    entityId: number;
    fromDirection: Direction;
    toDirection: Direction;
}


export interface DestroyEntityAction {
    type: "destroy";
    construct: Construct;
    entityId: number;
    x: number;
    y: number;
}


export interface CreateEntityAction {
    type: "create";
    construct: Construct;
    entityId: number;
    x: number;
    y: number;
}


export interface SwapOutEntityAction {
    type: "swapout";
    construct: Construct;
    entityId: number;
    x: number;
    y: number;
}


export interface SwapInEntityAction {
    type: "swapin";
    construct: Construct;
    entityId: number;
    x: number;
    y: number;
}