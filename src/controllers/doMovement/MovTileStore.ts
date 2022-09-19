import { Entity } from "../../object_classes/Entity.js";
import { Direction } from "../../types/Direction.js";
import { LevelController } from "../LevelController.js";
import { MovTileInfo } from "./MovTileInfo.js";
import { MovTilePointerTuple } from "./MovTilePointer.js";

export class MovTileStore {

    tiles: Record<number, undefined | MovTileInfo> = {};

    constructor(
        public controller: LevelController,
        public mainMoveEntities: Entity[],
        /** Parallel array with `mainMoveEntities` */
        public mainMoveEntityDirections: Direction[]
    ) {}

    _xyToTileNumber(x: number, y: number): number;
    _xyToTileNumber(pointer: MovTilePointerTuple): number;
    _xyToTileNumber(...args: [number, number] | [MovTilePointerTuple]): number;
    _xyToTileNumber(...args: [number, number] | [MovTilePointerTuple]): number {
        if (args.length === 2) {
            return args[1] * this.controller.level.width + args[0];
        } else {
            return args[0][1] * this.controller.level.width + args[0][0];
        }
    }


    getInfoAt(...args: XYOrTupleArgs): MovTileInfo | undefined {
        const tileNumber = this._xyToTileNumber(...args);
        return this.tiles[tileNumber];
    }

    createInfoAt(...args: XYOrTupleArgs): MovTileInfo {
        let x: number, y: number;
        if (args.length === 2) {
            [x,y] = args;
        } else {
            x = args[0][0];
            y = args[0][1];
        }
        const tileNumber = this._xyToTileNumber(x, y);
        if (this.tiles[tileNumber]) {
            return this.tiles[tileNumber]!;
        }
        const info = new MovTileInfo(this.controller, this.mainMoveEntities, this.mainMoveEntityDirections, x, y);
        this.tiles[tileNumber] = info;
        return info;
    }
}


type XYOrTupleArgs = [number, number] | [MovTilePointerTuple];