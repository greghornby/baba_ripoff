import { Action } from "../../main/Action.js";
import { Entity } from "../../main/Entity.js";
import { Interaction } from "../../main/Interaction.js";
import { LevelController } from "../../main/LevelController.js";
import { Direction } from "../../types/Direction.js";
import { addCoordinates } from "../actions/addCoordinates.js";
import { directionToXY } from "../actions/directionToXY.js";
import { getDirectionFromXY } from "../actions/getDirectionFromXY.js";
import { getOppositeDirection } from "../actions/getOppositeFacing.js";
import { getWordMap } from "../words/getWordMap.js";


export function doMovement(interaction: Interaction) {

    let somethingMoved: boolean = false;

    if (!(interaction.interaction.type === "move" || interaction.interaction.type === "wait")) {
        return false;
    }

    const controller = LevelController.instance;
    const actionProcessor = controller.actionProcessor;
    const topOfStack = actionProcessor.getTopOfStack();

    const youDirection: Direction | undefined = interaction.interaction.type === "move" ? interaction.interaction.direction : undefined;

    const youEntities = controller.getEntitiesByTag(words.you);
    const moveEntities = controller.getEntitiesByTag(words.move);

    const moveReboundEntities: Entity[] = [];


    //Calculate tile forces
    for (const type of ["you", "move", "moveRebound"] as const) {

        const entities =
            type === "you" ? youEntities :
            type === "move" ? moveEntities :
            type === "moveRebound" ? moveReboundEntities :
            [];

        const getEntityMoveDirection = (entity: Entity): Direction => {
            return (
                type === "you" ? youDirection! :
                type === "move" ? entity.facing :
                type === "moveRebound" ? getOppositeDirection(entity.facing) :
                Direction.down  //default by won't get hit
            );
        }

        if (type === "you" && !youDirection) {
            continue;
        }

        /** Map tileNumber to data */
        const tileForces: TileForces = {};
        const toPushEntities: ToPushEntities = new Map();

        for (const entity of entities) {
            const tileNumber = getTileFlatNumber(controller, entity.x, entity.y);
            const direction = getEntityMoveDirection(entity);
            addTileForce(tileForces, tileNumber, direction);

            findAllPushPull(toPushEntities, entity.x, entity.y, direction, "PUSH");
            findAllPushPull(toPushEntities, entity.x, entity.y, direction, "PULL");
        }

        // const toMove: ToMoveMap = new Map();
        const resolvedTiles: ResolvedTilesMap = new Map();

        const movementActions: Action[] = [];

        for (const [tileNumber, [x, y, data]] of toPushEntities) {

            const position: TileXY = [x, y];

            for (const type of ["push", "pull"] as const) {
                const moveEntities = data[type];

                //deterministic approach
                deterministic:
                for (let dX = 1; dX > -2; dX--) {
                    for (let dY = 1; dY > -2; dY--) {
                        const deltaDirection = getDirectionFromXY(dX, dY);
                        if (!deltaDirection) {
                            continue;
                        }
                        const fromPosition = addCoordinates(position, [dX, dY], false);
                        const fromTileNumber = getTileFlatNumber(controller, ...fromPosition);
                        const inDirection = type === "push" ? getOppositeDirection(deltaDirection) : deltaDirection;
                        const fromHasForceInDirection = tileForces[fromTileNumber]?.includes(inDirection);
                        if (fromHasForceInDirection) {
                            const resolution = resolveTile(tileForces, resolvedTiles, inDirection, youDirection, position);
                            if (resolution) {
                                const toPosition = addCoordinates(
                                    position,
                                    type === "push" ? [-dX, -dY] : [dX, dY],
                                    false
                                );
                                for (const moveEntity of moveEntities) {
                                    movementActions.push(new Action(actionProcessor.step, {
                                        type: "movement",
                                        startX: position[0],
                                        startY: position[1],
                                        endX: toPosition[0],
                                        endY: toPosition[1],
                                        entityId: moveEntity.id
                                    }));
                                }
                                break deterministic;
                            }
                        }
                    }
                }
            }

        }

        entityLoop:
        for (const entity of entities) {
            const direction = getEntityMoveDirection(entity);
            const toPosition = addCoordinates([entity.x, entity.y], directionToXY(direction));

            if (entity.facing !== direction) {
                movementActions.push(new Action(actionProcessor.step, {
                    type: "facing",
                    fromDirection: entity.facing,
                    toDirection: direction,
                    entityId: entity.id
                }));
            }

            let moveRebound: boolean = false;

            const gridEntities = controller.getGridCell(...toPosition);
            if (!gridEntities) {
                if (type === "move") {
                    moveRebound = true;
                } else {
                    continue entityLoop;
                }
            } else {
                //hacky fix for PULL should block (and add STOP for good measure)
                for (const e of gridEntities) {
                    const t = controller.getEntityTags(e);
                    if ((t.has(words.stop) || t.has(words.pull)) && !t.has(words.push)) {
                        if (type === "move") {
                            moveRebound = true;
                        } else {
                            continue entityLoop;
                        }
                    }
                }
            }

            if (moveRebound) {
                moveReboundEntities.push(entity);
                continue entityLoop;
            }

            const resolution = resolveTile(tileForces, resolvedTiles, direction, youDirection, toPosition);
            if (resolution) {
                movementActions.push(new Action(actionProcessor.step, {
                    type: "movement",
                    startX: entity.x,
                    startY: entity.y,
                    endX: toPosition[0],
                    endY: toPosition[1],
                    entityId: entity.id
                }));
            } else {
                moveReboundEntities.push(entity);
                continue entityLoop;
            }
        }

        topOfStack.push(...movementActions);

        const movedBoolean = actionProcessor.playActionsOnTopOfStack(false);
        somethingMoved = somethingMoved || movedBoolean;
    }

    if (somethingMoved) {
        actionProcessor.addStep();
    }

    return somethingMoved;
}


function resolveTile(
    tileForces: TileForces,
    cache: ResolvedTilesMap,
    fromDirection: Direction,
    youDirection: Direction | undefined,
    position: TileXY
): boolean {

    const controller = LevelController.instance;
    const tileNumber = getTileFlatNumber(controller, ...position);
    let cachedDirections = cache.get(tileNumber);
    if (!cachedDirections) {
        cachedDirections = {up: undefined, down: undefined, right: undefined, left: undefined};
        cache.set(tileNumber, cachedDirections);
    } else {
        if (cachedDirections[fromDirection] !== undefined) {
            return cachedDirections[fromDirection]!;
        }
    }

    const entities = controller.getEntitiesAtPosition(...position);
    for (const entity of entities) {
        const tags = controller.getEntityTags(entity);

        if (tags.has(words.stop) && !tags.has(words.push) && !tags.has(words.pull)) {
            if (tags.has(words.you) && youDirection) {
                const nextPosition = addCoordinates(position, directionToXY(youDirection), false);
                if (!controller.getGridCell(...nextPosition)) {
                    return (cachedDirections[fromDirection] = false);
                }
                const youNextTileResolution = resolveTile(
                    tileForces,
                    cache,
                    youDirection,
                    youDirection,
                    nextPosition
                );
                if (!youNextTileResolution) {
                    return (cachedDirections[fromDirection] = false);
                }
            } else {
                return (cachedDirections[fromDirection] = false);
            }
        }

        if (tags.has(words.push) || tags.has(words.pull)) {
            addTileForce(tileForces, tileNumber, fromDirection);
            const nextPosition = addCoordinates(position, directionToXY(fromDirection), false);
                if (!controller.getGridCell(...nextPosition)) {
                    return (cachedDirections[fromDirection] = false);
                }
            const pushPullNextTileResolution = resolveTile(
                tileForces,
                cache,
                fromDirection,
                youDirection,
                nextPosition
            );
            if (!pushPullNextTileResolution) {
                return (cachedDirections[fromDirection] = false);
            }
        }

    }
    //if passed everything, resolve as true
    return (cachedDirections[fromDirection] = true);
}


function addTileForce(tileForces: TileForces, tileNumber: number, direction: Direction) {
    let arr = tileForces[tileNumber];
    if (!arr) {
        arr = [direction];
        tileForces[tileNumber] = arr;
        return;
    }
    if (!arr.includes(direction)) {
        arr.push(direction);
    }
}


function findAllPushPull(
    toPushEntities: ToPushEntities,
    x: number,
    y: number,
    direction: Direction,
    type: "PUSH" | "PULL"
): void {
    const controller = LevelController.instance;
    const positionXY: TileXY = [x,y];
    const deltaXY: TileXY = directionToXY(type === "PUSH" ? direction : getOppositeDirection(direction));

    let iter = 1000;
    while (iter--) {
        addCoordinates(positionXY, deltaXY, true);
        const entities = controller.getEntitiesAtPosition(...positionXY);
        const tileNum = getTileFlatNumber(controller, ...positionXY);
        if (toPushEntities.has(tileNum)) {
            continue;
        }
        let found: boolean = false;
        for (const entity of entities) {
            if (
                type === "PUSH" ?
                controller.getEntityTags(entity).has(words.push) :
                controller.getEntityTags(entity).has(words.pull)
            ) {
                found = true;
                const [,,data] = toPushEntities.get(tileNum) ?? toPushEntities.set(tileNum, [...positionXY, {push: [], pull: []}]).get(tileNum)!;
                const arr = type === "PUSH" ? data.push : data.pull;
                arr.push(entity);
            }
        }
    }
}


function getTileFlatNumber(controller: LevelController, x: number, y: number): number {
    return y * controller.level.width + x;
}


const words = getWordMap("you", "move", "pull", "push", "stop");

type ResolvedTilesMap = Map<number, Record<Direction, boolean | undefined>>;
type TileForces = Record<number, undefined | Direction[]>;
type ToPushEntities = Map<number, [x: number, y: number, data: {push: Entity[]; pull: Entity[]}]>;
type TileXY = [x: number, y: number];
