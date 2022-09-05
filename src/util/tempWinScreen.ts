import * as pixi from "pixi.js";
import { level01 } from "../levels/level01.js";
import { levelDebug } from "../levels/levelDebug.js";
import { LevelController } from "../main/LevelController.js";
import { queryParams } from "./queryParams.js";

const levels = [level01, levelDebug];
let levelIndex = queryParams.level  && !isNaN(parseInt(queryParams.level)) ? parseInt(queryParams.level) : 0;

export const loadLevel = () => {
    if (levelIndex >= levels.length) {
        levelIndex = 0;
    }
    const level = levels[levelIndex];
    if (level) {
        levelIndex++;
        level().load();
    }
}

export const tempWinScreen = async (controller: LevelController) => {
    const winGraphic = new pixi.Text("WINNER!!!", new pixi.TextStyle({
        fontFamily : 'Arial',
        fontSize: 100,
        fill : 0xeeccaa,
        align : 'left'
    }));
    winGraphic.anchor.set(0.5, 0.5);
    const scale = controller._getScale();
    winGraphic.scale.set(scale, scale);
    const center = controller._getCenter("level");
    winGraphic.transform.position.set(center[0], center[1]);
    winGraphic.zIndex = Infinity;
    controller.container.addChild(winGraphic);

    for await (const alpha of fadeIn(winGraphic)) {}
    controller.exit();
    loadLevel();
};

async function* fadeIn(container: pixi.Container) {

    container.alpha = 0;

    while (container.alpha < 1) {
        console.log("increasing");
        await new Promise(r => setTimeout(r, 1000/60));
        container.alpha += 0.05;
        yield container.alpha;
    }
}