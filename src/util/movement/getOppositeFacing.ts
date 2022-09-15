import { Direction } from "../../types/Direction.js";

export function getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.left: return Direction.right;
        case Direction.right: return Direction.left;
        case Direction.up: return Direction.down;
        case Direction.down: return Direction.up;
    }
}