import { Entity } from "../../classes/Entity.js";
import { words } from "../../data/words.js";
import { Direction } from "../../types/Direction.js";
import { EmptyArray } from "../../util/data/EmptyArray.js";
import { LevelController } from "../LevelController.js";
import { IMainMoveEntity } from "./IMainMoveEntity.js";

export class MovTileInfo {

    static movementRanks: {[T in Exclude<MovMovementTypes, "main">]: [Direction, Direction, Direction, Direction]} = {
        push: [Direction.left, Direction.up, Direction.down, Direction.right],
        pull: [Direction.right, Direction.down, Direction.up, Direction.left],
        shift: [Direction.right, Direction.up, Direction.down, Direction.left]
    };

    outOfBounds: boolean = false;

    pushDirection?: Direction;
    pullDirection?: Direction;

    isStopped: boolean = false;
    allStopsCanBeOpened: boolean = false;
    hasPushableOpen: boolean = false;

    status?: Partial<Record<Direction, MovMovementDirectionStatus>>;

    entities: readonly Entity[];

    /** Only defined if it has push entities */
    pullEntities?: Entity[];
    /** Only defined if it has pull entities */
    pushEntities?: Entity[];
    mainMoveEntities?: IMainMoveEntity[];

    expendedEntities?: Set<Entity>;

    constructor(
        public controller: LevelController,
        allMainMoveEntities: IMainMoveEntity[],
        public x: number,
        public y: number
    ) {
        if (x < 0 || x >= controller.level.width || y < 0 || y >= controller.level.height) {
            this.entities = EmptyArray;
            this.outOfBounds = true;
            return;
        }

        let allStopsCanBeOpened = true;
        const entities = controller.getEntitiesAtPosition(x, y);
        this.entities = entities;
        for (const e of entities) {
            const tags = controller.getEntityTags(e);
            const isPush = tags.has(words.push);
            const isPull = tags.has(words.pull);
            const isStop = tags.has(words.stop);
            const isStopWithoutPushOrPull = isStop && !isPush && !isPull;
            if (isPush) {
                (this.pushEntities ??= []).push(e);
                if (tags.has(words.open)) {
                    this.hasPushableOpen = true;
                }
            }
            if (isPull) {
                (this.pullEntities ??= []).push(e);
            }
            if (isStopWithoutPushOrPull) {
                this.isStopped = true;
            }
            if (isStop) {
                if (!tags.has(words.shut)) {
                    allStopsCanBeOpened = false;
                }
            }

            const mainMoveEntity = allMainMoveEntities.find(item => item.entity === e);
            if (mainMoveEntity) {
                const mainEntityDirection = mainMoveEntity.direction;
                if (!isStopWithoutPushOrPull) {
                    (this.status = this.status ?? {})[mainEntityDirection] = MovMovementDirectionStatus.pending;
                }
                (this.mainMoveEntities ??= []).push(mainMoveEntity);
            }
        }
        this.allStopsCanBeOpened = allStopsCanBeOpened;
    }

    addPush(direction: Direction): boolean {
        if (!this.pushEntities) {
            return false;
        }
        this.pushDirection = MovTileInfo._getHighestDirectionOrder("push", this.pushDirection, direction);
        return true;
    }

    addPull(direction: Direction): boolean {
        if (!this.pullEntities) {
            return false;
        }
        this.pullDirection = MovTileInfo._getHighestDirectionOrder("pull", this.pullDirection, direction);
        return true;
    }

    hasPendingStatuses(): boolean {
        if (!this.status) {
            return false;
        }
        for (const d in this.status) {
            if (this.status[d as Direction] === MovMovementDirectionStatus.pending) {
                return true;
            }
        }
        return false;
    }

    allStatusesClear(): boolean {
        if (!this.status) {
            return true;
        }
        for (const d in this.status) {
            if (this.status[d as Direction] !== MovMovementDirectionStatus.clear) {
                return false;
            }
        }
        return true;
    }

    /**
     * To mimic the base game, we will use this order of precedence for multiple PUSH/PULL directions.
     *
     * PUSH: LEFT, UP, DOWN, RIGHT
     * PULL: RIGHT, DOWN, UP, LEFT
     */
    static _getHighestDirectionOrder(type: keyof typeof MovTileInfo["movementRanks"], currentDirection: Direction | undefined, newDirection: Direction): Direction {
        if (!currentDirection) {
            return newDirection;
        }
        const ranks = MovTileInfo.movementRanks[type];
        const currentRank = ranks.indexOf(currentDirection);
        const newRank = ranks.indexOf(newDirection);
        //lowest rank wins (this is probably more efficient than Math.min)
        const bestRank = currentRank < newRank ? currentRank : newRank;
        return ranks[bestRank];
    }

    toJSON() {
        const obj: any = {};
        for (const key in this) {
            switch(typeof this[key]) {
                case "string":
                case "number":
                case "boolean":
                case "undefined":
                    obj[key] = this[key];
                    break;
                default:
                    obj[key] = !this[key]  ? this[key] : "[object]";
            }
        }
        return obj;
    }
}

export type MovMovementTypes = "main" | "push" | "pull" | "shift";

export enum MovMovementDirectionStatus {
    pending,
    resolving,
    blocked,
    clear
}