import { Direction } from "../../types/Direction.js";
import { getOppositeDirection } from "../../util/movement/getOppositeFacing.js";
import { MovMovementDirectionStatus, MovTileInfo } from "./MovTileInfo.js";
import { MovTilePointer } from "./MovTilePointer.js";
import { MovTileStore } from "./MovTileStore.js";

export function resolveTile(
    tileStore: MovTileStore,
    tileInfo: MovTileInfo
): void {

    if (!tileInfo.status) {
        return;
    }

    const pointer = new MovTilePointer(tileInfo.x, tileInfo.y);

    let direction: Direction;
    for (direction in tileInfo.status) {
        if (tileInfo.status[direction] === MovMovementDirectionStatus.pending) {
            tileInfo.status[direction] = MovMovementDirectionStatus.resolving;
            const clear = searchDirection(tileStore, tileInfo, pointer, direction);
        }
    }
}

function searchDirection(
    tileStore: MovTileStore,
    startTileInfo: MovTileInfo,
    pointer: MovTilePointer,
    direction: Direction
): boolean {

    pointer.reset();
    lookAhead(tileStore, startTileInfo, pointer, direction);
    pointer.reset();

    const addPush: MovTileInfo[] = [];
    const addPull: MovTileInfo[] = [];
    const addPushFromPull: MovTileInfo[] = [];

    let inPushCheck = true;
    let failedForward = false;
    let failedPull = false;
    let previousTileFromPush = startTileInfo;
    const backwardsDirection = getOppositeDirection(direction);
    let ITER = 1e3;
    loop:
    while (ITER--) {
        if (inPushCheck) {
            pointer.move(direction);
            const tile = tileStore.createInfoAt(pointer);
            if (tile.outOfBounds) {
                failedForward = true;
                break loop;
            }
            if (tile.isStopped || (tile.pullEntities && !tile.pullDirection && !tile.pushEntities)) {
                if (tile.entities.find(e => e.id === 17)) {
                    console.log("TILE", JSON.stringify(tile));
                    console.log("PREVIOUS", JSON.stringify(previousTileFromPush));
                }
                const pushingOpenOntoStop = tile.allStopsCanBeOpened && previousTileFromPush.hasPushableOpen;
                if (!pushingOpenOntoStop) {
                    failedForward = true;
                    break loop;
                }
            }
            if (tile.hasPendingStatuses()) {
                resolveTile(tileStore, tile);
                if (!tile.allStatusesClear()) {
                    failedForward = true;
                    break loop;
                }
            }
            if (!tile.pushEntities) {
                inPushCheck = false;
                pointer.reset();
                startTileInfo.status![direction] = MovMovementDirectionStatus.clear;
                continue;
            }
            addPush.push(tile);
            addPull.push(previousTileFromPush);
            previousTileFromPush = tile;
        //must be pull check
        } else {
            const tile = tileStore.createInfoAt(pointer);
            pointer.move(backwardsDirection);
            const behindTile = tileStore.createInfoAt(pointer);
            if (behindTile.outOfBounds) {
                break loop;
            }
            if (!behindTile.pullEntities) {
                break loop;
            }
            if (tile.isStopped) {
                failedPull = true;
                break loop;
            }
            if (tile.hasPendingStatuses()) {
                resolveTile(tileStore, tile);
                if (!tile.allStatusesClear()) {
                    failedPull = true;
                    break loop;
                }
            }
            addPushFromPull.push(tile);
            addPull.push(behindTile);
        }
    }

    if (failedForward) {
        startTileInfo.status![direction] = MovMovementDirectionStatus.blocked;
        return false;
    }

    if (!failedForward) {
        for (const t of addPush) {
            t.addPush(direction);
        }
    }
    if (!failedPull) {
        for (const t of addPushFromPull) {
            t.addPush(direction);
        }
        for (const t of addPull) {
            t.addPull(direction);
        }
    }

    return true;
}


function lookAhead (
    tileStore: MovTileStore,
    startTileInfo: MovTileInfo,
    pointer: MovTilePointer,
    direction: Direction
): void {
    let ITER = 1e3;
    while (ITER--) {
        pointer.move(direction);
        const tile = tileStore.createInfoAt(pointer);
        if (tile.status && tile.hasPendingStatuses()) {
            searchDirection(tileStore, tile, new MovTilePointer(pointer[0], pointer[1]), direction);
            return;
        }
        if (!(tile.pushEntities || tile.pullEntities)) {
            return;
        }
    }
}