import { AppEventInterface } from "../../app/AppEventInterface.js";
import { Interaction } from "../../main/Interaction.js";
import { LevelController } from "../../main/LevelController.js";
import { Direction } from "../../types/Direction.js";

export function getInteractionFromSwipe(controller: LevelController, event: AppEventInterface.Swipe): Interaction | undefined {
    let interactionType: Interaction["interaction"];

    const requiredDistance = controller.level.TILE_SIZE * controller.container.scale.x;
    if (event.adjacentDistance < requiredDistance) {
        return;
    }

    switch (event.direction) {
        case "right":
            interactionType = {type: "move", direction: Direction.right};
            break;
        case "left":
            interactionType = {type: "move", direction: Direction.left};
            break;
        case "up":
            interactionType = {type: "move", direction: Direction.up};
            break;
        case "down":
            interactionType = {type: "move", direction: Direction.down};
            break;
    }

    return {interaction: interactionType};
}