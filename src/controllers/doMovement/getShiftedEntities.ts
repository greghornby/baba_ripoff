import { Entity } from "../../classes/Entity.js";
import { words } from "../../data/words.js";
import { ActionController } from "../ActionController.js";
import { IMainMoveEntity } from "./IMainMoveEntity.js";
import { MovTileInfo } from "./MovTileInfo.js";

export function getShiftedEntities(
    actionCont: ActionController
): IMainMoveEntity[] {

    const levelCont = actionCont.controller;

    const shiftEntities = levelCont.getEntitiesByTag(words.shift);

    const shiftedEntities: Map<Entity, IMainMoveEntity> = new Map();

    for (const shiftEntity of shiftEntities) {

        const shiftDirection = shiftEntity.facing;

        const tileEntities = levelCont.getEntitiesAtPosition(shiftEntity.x, shiftEntity.y);
        for (const tileEntity of tileEntities) {
            if (tileEntity === shiftEntity) {
                continue;
            }
            const data = shiftedEntities.get(tileEntity);
            if (!data) {
                shiftedEntities.set(tileEntity, {
                    entity: tileEntity,
                    direction: shiftDirection
                });
            } else {
                data.direction = MovTileInfo._getHighestDirectionOrder("shift", data.direction, shiftDirection);
            }
        }
    }

    return [...shiftedEntities.values()];
}