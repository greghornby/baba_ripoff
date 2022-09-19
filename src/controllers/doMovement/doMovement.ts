import { Entity } from "../../object_classes/Entity.js";
import { Direction } from "../../types/Direction.js";
import { Interaction } from "../../types/Interaction.js";
import { addCoordinates } from "../../util/movement/addCoordinates.js";
import { directionToXY } from "../../util/movement/directionToXY.js";
import { getOppositeDirection } from "../../util/movement/getOppositeFacing.js";
import { getWordMap } from "../../util/words/getWordMap.js";
import { Action } from "../Action.js";
import { ActionProcessor } from "../ActionProcessor.js";
import { MovMovementDirectionStatus, MovTileInfo } from "./MovTileInfo.js";
import { MovTileStore } from "./MovTileStore.js";
import { resolveTile } from "./resolveTile.js";

const words = getWordMap("you", "move", "pull", "push", "stop");

export function doMovement(this: ActionProcessor, interaction: Interaction, addStep: boolean): boolean {

    let somethingMoved = false;

    const controller = this.controller;
    const topOfStack = this.getTopOfStack();

    const youDirection: Direction | undefined = interaction.interaction.type === "move" ? interaction.interaction.direction : undefined;

    const youEntities = Array.from(controller.getEntitiesByTag(words.you));
    const moveEntities = Array.from(controller.getEntitiesByTag(words.move));

    let mustDoReboundStep = false;

    mainLoop:
    for (const type of ["you", "move", "moveRebound"] as const) {

        if (type === "you" && !youDirection) {
            continue;
        }
        if (type === "moveRebound" && !mustDoReboundStep) {
            continue;
        }

        const mainEntities =
            type === "you" ? youEntities :
            type === "move" || type === "moveRebound" ? moveEntities :
            [];

        /** Parallel array with `mainEntities` */
        const mainEntityDirections: Direction[] = [];
        for (const entity of mainEntities) {
            const direction = (
                type === "you" ? youDirection! :
                type === "move" || type === "moveRebound" ? entity.facing :
                Direction.down  //default by won't get hit
            );
            mainEntityDirections.push(direction);
        }

        const tileStore: MovTileStore = new MovTileStore(controller, mainEntities, mainEntityDirections);

        const mainTiles: MovTileInfo[] = [];

        for (const mainEntity of mainEntities) {
            if (!tileStore.getInfoAt(mainEntity.x, mainEntity.y)) {
                mainTiles.push(
                    tileStore.createInfoAt(mainEntity.x, mainEntity.y)
                );
            }
        }

        for (const tile of mainTiles) {
            resolveTile(tileStore, tile);
        }

        if (type === "move") {
            for (const tile of mainTiles) {
                for (const direction in tile.status!) {
                    if (tile.status![direction as Direction] !== MovMovementDirectionStatus.blocked) {
                        continue;
                    }
                    mustDoReboundStep = true;
                    for (const e of tile.mainMoveEntities!) {
                        if (e.facing === direction as Direction) {
                            topOfStack.push(new Action(this.step, {
                                type: "facing",
                                entityId: e.id,
                                fromDirection: e.facing,
                                toDirection: getOppositeDirection(e.facing)
                            }));
                        }
                    }
                }
            }
            if (mustDoReboundStep) {
                this.playActionsOnTopOfStack(false);
                continue mainLoop;
            }
        }

        const movementActions: Action[] = [];
        for (const tileNumber in tileStore.tiles) {

            const tile = tileStore.tiles[tileNumber]!;
            const expendedEntities: Set<Entity> = new Set();

            if (tile.mainMoveEntities) {
                const startPos = [tile.x, tile.y] as const;
                const len = tile.mainMoveEntities.length;
                for (let i = 0; i < len; i++) {
                    const entity = tile.mainMoveEntities[i];
                    const direction = tile.mainMoveEntityDirections![i];
                    addFacingAction(this, movementActions, entity, direction);
                    if (tile.status![direction] === MovMovementDirectionStatus.clear) {
                        const endPos = addCoordinates(startPos, directionToXY(direction), false);
                        expendedEntities.add(entity);
                        addMovementAction(this, movementActions, entity, startPos, endPos);
                    }
                }
            }

            pull:
            if (tile.pullEntities) {
                const direction = tile.pullDirection;
                if (!direction) {
                    break pull;
                }
                const startPos = [tile.x, tile.y] as const;
                const endPos = addCoordinates(startPos, directionToXY(direction), false);
                for (const entity of tile.pullEntities) {
                    if (expendedEntities.has(entity)) {
                        continue;
                    }
                    expendedEntities.add(entity);
                    addFacingAction(this, movementActions, entity, direction);
                    addMovementAction(this, movementActions, entity, startPos, endPos);
                }
            }

            push:
            if (tile.pushEntities) {
                const direction = tile.pushDirection;
                if (!direction) {
                    break push;
                }
                const startPos = [tile.x, tile.y] as const;
                const endPos = addCoordinates(startPos, directionToXY(direction), false);
                for (const entity of tile.pushEntities) {
                    if (expendedEntities.has(entity)) {
                        continue;
                    }
                    expendedEntities.add(entity);
                    addFacingAction(this, movementActions, entity, direction);
                    addMovementAction(this, movementActions, entity, startPos, endPos);
                }
            }
        }

        for (const action of movementActions) {
            // console.log(JSON.stringify(action));
        }
        topOfStack.push(...movementActions);

        const movedBoolean = this.playActionsOnTopOfStack(false);
        somethingMoved = somethingMoved || movedBoolean;
    }

    if (somethingMoved && addStep) {
        this.addStep();
    }

    return somethingMoved;
}

function addFacingAction(
    aP: ActionProcessor,
    actions: Action[],
    entity: Entity,
    direction: Direction
) {
    if (entity.facing !== direction) {
        actions.push(new Action(aP.step, {
            type: "facing",
            entityId: entity.id,
            fromDirection: entity.facing,
            toDirection: direction
        }));
    }
}

function addMovementAction(
    aP: ActionProcessor,
    actions: Action[],
    entity: Entity,
    start: readonly [number, number],
    end: readonly [number, number],
) {
    actions.push(new Action(aP.step, {
        type: "movement",
        entityId: entity.id,
        startX: start[0],
        startY: start[1],
        endX: end[0],
        endY: end[1]
    }));
}