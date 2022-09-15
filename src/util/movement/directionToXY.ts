import { Direction } from "../../types/Direction.js";

/**
 * Returns an [x,y] representing the movement. Power represents how many tiles to move.
 * If direction specified, returns [x,y], if no direction, returns map of all directions with [x,y]
 */
export function directionToXY(direction: Direction): readonly [x: number, y: number];
export function directionToXY(): Record<Direction, readonly [x: number, y: number]>;
export function directionToXY(direction?: Direction): readonly [x: number, y: number] | Record<Direction, readonly [x: number, y: number]> {

    const all = direction ? undefined : Object.values(Direction);
    const map = direction ? undefined : {} as Record<Direction, readonly [x: number, y: number]>;
    let i = 0;
    for (let d = (direction ? direction : all![i]); direction ? true : i < all!.length; i++, d = (direction ? direction : all![i])) {
        let value: readonly [x: number, y: number];
        switch (d) {
            case Direction.right: value = RIGHT; break;
            case Direction.left: value = LEFT; break;
            case Direction.down: value = DOWN; break;
            case Direction.up: value = UP; break;
        }
        if (direction) {
            return value;
        } else {
            map![d] = value;
        }
    }
    return map!;
}

const RIGHT: Readonly<[number, number]> = [1,0];
const LEFT: Readonly<[number, number]> = [-1,0];
const DOWN: Readonly<[number, number]> = [0, 1];
const UP: Readonly<[number, number]> = [0,-1];