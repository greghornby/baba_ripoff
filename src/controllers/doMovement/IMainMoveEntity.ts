import { Entity } from "../../classes/Entity.js";
import { Direction } from "../../types/Direction.js";

export interface IMainMoveEntity {
    entity: Entity;
    direction: Direction;
}