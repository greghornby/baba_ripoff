import { Direction } from "../../../../types/Direction.js";

export class MovTilePointer implements MovTilePointerTuple {

    0: number;
    1: number;
    original: MovTilePointerTuple;

    constructor(x: number, y: number) {
        this[0] = x;
        this[1] = y;
        this.original = [x,y];
    }

    reset(): this {
        this[0] = this.original[0];
        this[1] = this.original[1];
        return this;
    }

    move(direction: Direction): this {
        switch (direction) {
            case Direction.left:
                this[0]--;
                break;
            case Direction.right:
                this[0]++;
                break;
            case Direction.up:
                this[1]--;
                break;
            case Direction.down:
                this[1]++;
                break;
        }
        return this;
    }
}

/**
 * Can use a tuple
 * const position: MovTilePointerTuple = [1, 2]; //x = 1, y = 2
 */
export type MovTilePointerTuple = {0: number, 1: number};