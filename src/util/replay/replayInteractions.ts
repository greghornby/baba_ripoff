import { LevelController } from "../../main/LevelController.js";
import { stringToInteractions } from "./stringToInteractions.js";

export function replayInteractions(text: string) {
    const controller = LevelController.instance!;
    const interactions = stringToInteractions(text);
    let i = 0;
    const timer = (setInterval as Window["setInterval"])(() => {
        const interaction = interactions[i];
        if (!interaction) {
            clearInterval(timer);
            return;
        }
        i++;
        controller.currentInteraction = interaction;
    }, 200);
}