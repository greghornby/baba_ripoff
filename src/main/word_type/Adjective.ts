import { Entity } from "../Entity.js";
import { Word } from "../Word.js";

export class Adjective extends Word {

    constructor(
        public entityTickBehavior: EntityTickBehaviorFunction
    ) {
        super();
    }
}

type EntityTickBehaviorFunction = (entity: Entity) => void;