import * as pixi from "pixi.js";
import { LevelController } from "../../controllers/LevelController.js";
import { MenuController } from "../../menu/MenuController.js";
import { interactionsToString } from "../replay/interactionsToString.js";

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
    controller.containers.splash.addChild(winGraphic);

    for await (const alpha of fadeIn(winGraphic)) {}
    await wait();
    if (controller.level.initData.debugPromptCopyInteractions) {
        const text = interactionsToString(controller.actionProcessor.interactions);
        await navigator.clipboard.writeText(text);
        alert("Solution copied to clipboard. Please DM me");
    }
    controller.exit();
    MenuController.load();
};

async function* fadeIn(container: pixi.Container) {

    container.alpha = 0;

    while (container.alpha < 1) {
        await new Promise(r => setTimeout(r, 1000/60));
        container.alpha += 0.05;
        yield container.alpha;
    }
}

async function wait() {
    return new Promise(r => setTimeout(r, 2000));
}