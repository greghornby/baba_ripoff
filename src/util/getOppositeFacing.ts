import { Facing } from "../types/Facing.js";

export function getOppositeFacing(facing: Facing): Facing {
    switch (facing) {
        case Facing.left: return Facing.right;
        case Facing.right: return Facing.left;
        case Facing.up: return Facing.down;
        case Facing.down: return Facing.up;
    }
}