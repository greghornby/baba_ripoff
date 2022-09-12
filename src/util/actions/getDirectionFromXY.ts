import { Direction } from "../../types/Direction.js";

export function getDirectionFromXY(x: number, y: number): Direction | undefined {
    const valid = x !== y && (x === 0 || y === 0);
    if (valid) {
        switch (x) {
            case 1: return Direction.right;
            case -1: return Direction.left;
        }
        switch (y) {
            case 1: return Direction.down;
            case -1: return Direction.up;
        }
    }
    return undefined;
}