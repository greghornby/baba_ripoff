import { Action } from "../../classes/Action.js";
import { Entity } from "../../classes/Entity.js";
import { Direction } from "../../types/Direction.js";
import { Interaction } from "../../types/Interaction.js";
import { addCoordinates } from "../../util/movement/addCoordinates.js";
import { directionToXY } from "../../util/movement/directionToXY.js";
import { getOppositeDirection } from "../../util/movement/getOppositeFacing.js";
import { getWordMap } from "../../util/words/getWordMap.js";
import { ActionController } from "../ActionController.js";
import { getShiftedEntities } from "./getShiftedEntities.js";
import { IMainMoveEntity } from "./IMainMoveEntity.js";
import { MovMovementDirectionStatus, MovTileInfo } from "./MovTileInfo.js";
import { MovTileStore } from "./MovTileStore.js";
import { resolveTile } from "./resolveTile.js";

const words = getWordMap("you", "move", "pull", "push", "stop");

export function doMovement(this: ActionController, interaction: Interaction, addStep: boolean): boolean {

    let somethingMoved = false;

    const controller = this.controller;
    const topOfStack = this.getTopOfStack();

    const youDirection: Direction | undefined = interaction.interaction.type === "move" ? interaction.interaction.direction : undefined;
    let mustDoReboundStep = false;

    mainLoop:
    for (const type of ["you", "move", "moveRebound", "shift"] as const) {

        if (type === "you" && !youDirection) {
            continue;
        }
        if (type === "moveRebound" && !mustDoReboundStep) {
            continue;
        }

        const mainEntities: IMainMoveEntity[] =
            type === "you" ? Array.from(controller.getEntitiesByTag(words.you)).map<IMainMoveEntity>(y => ({entity: y, direction: youDirection!})) :
            type === "move" || type === "moveRebound" ? Array.from(controller.getEntitiesByTag(words.move)).map<IMainMoveEntity>(m => ({entity: m, direction: m.facing})) :
            type === "shift" ? getShiftedEntities(this) :
            [];

        const tileStore: MovTileStore = new MovTileStore(controller, mainEntities);

        const mainTiles: MovTileInfo[] = [];

        for (const {entity} of mainEntities) {
            if (!tileStore.getInfoAt(entity.x, entity.y)) {
                mainTiles.push(
                    tileStore.createInfoAt(entity.x, entity.y)
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
                        if (e.direction === direction as Direction) {
                            topOfStack.push(new Action(this.step, {
                                type: "facing",
                                entityId: e.entity.id,
                                fromDirection: e.direction,
                                toDirection: getOppositeDirection(e.direction)
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
                const startPos: [number, number] = [tile.x, tile.y];
                const endPos: [number, number] = [...startPos];
                for (const {entity, direction} of tile.mainMoveEntities) {
                    addFacingAction(this, movementActions, entity, direction);
                    const directionCoords = directionToXY(direction);
                    if (tile.status![direction] === MovMovementDirectionStatus.clear) {
                        addCoordinates(endPos, directionCoords, true);
                        expendedEntities.add(entity);
                        addMovementAction(this, movementActions, entity, startPos, endPos);
                    }
                }
            }

            pull:
            if (tile.pullEntities) {
                const pullDirection = tile.pullDirection;
                if (!pullDirection) {
                    break pull;
                }
                const startPos = [tile.x, tile.y] as const;
                const endPos = addCoordinates(startPos, directionToXY(pullDirection), false);
                for (const entity of tile.pullEntities) {
                    if (expendedEntities.has(entity)) {
                        continue;
                    }
                    expendedEntities.add(entity);
                    addFacingAction(this, movementActions, entity, pullDirection);
                    addMovementAction(this, movementActions, entity, startPos, endPos);
                }
            }

            push:
            if (tile.pushEntities) {
                const pushDirection = tile.pushDirection;
                if (!pushDirection) {
                    break push;
                }
                const startPos = [tile.x, tile.y] as const;
                const endPos = addCoordinates(startPos, directionToXY(pushDirection), false);
                for (const entity of tile.pushEntities) {
                    if (expendedEntities.has(entity)) {
                        continue;
                    }
                    expendedEntities.add(entity);
                    addFacingAction(this, movementActions, entity, pushDirection);
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
    actionCont: ActionController,
    actions: Action[],
    entity: Entity,
    direction: Direction
) {
    if (entity.facing !== direction) {
        actions.push(new Action(actionCont.step, {
            type: "facing",
            entityId: entity.id,
            fromDirection: entity.facing,
            toDirection: direction
        }));
    }
}

function addMovementAction(
    actionCont: ActionController,
    actions: Action[],
    entity: Entity,
    start: readonly [number, number],
    end: readonly [number, number],
) {
    actions.push(new Action(actionCont.step, {
        type: "movement",
        entityId: entity.id,
        startX: start[0],
        startY: start[1],
        endX: end[0],
        endY: end[1]
    }));
}