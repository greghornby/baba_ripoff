import { Direction } from "../../types/Direction.js";

/**
 * Returns an [x,y] representing the movement. Power represents how many tiles to move.
 * If direction specified, returns [x,y], if no direction, returns map of all directions with [x,y]
 */
export function directionToXY(direction: Direction, power?: number): [x: number, y: number];
export function directionToXY(power?: number): Record<Direction, [x: number, y: number]>;
export function directionToXY(
    ...args: [Direction, number?] | [number?]
): [x: number, y: number] | Record<Direction, [x: number, y: number]> {
    const arg0 = args[0];
    const arg1 = args[1];
    const power = typeof arg1 === "number" ? arg1 : typeof arg0 === "number" ? arg0 : 1;
    const direction = typeof arg0 === "string" ? arg0 : undefined;

    const all = direction ? undefined : Object.values(Direction);
    const map = direction ? undefined : {} as Record<Direction, [x: number, y: number]>;
    let i = 0;
    for (let d = (direction ? direction : all![i]); direction ? true : i < all!.length; i++, d = (direction ? direction : all![i])) {
        let value: [x: number, y: number];
        switch (d) {
            case Direction.right: value = [1*power,0]; break;
            case Direction.left: value = [-1*power,0]; break;
            case Direction.down: value = [0,1*power]; break;
            case Direction.up: value = [0, -1*power]; break;
        }
        if (direction) {
            return value;
        } else {
            map![d] = value;
        }
    }
    return map!;
}