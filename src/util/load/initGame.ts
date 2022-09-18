import { App } from "../../app/App.js";
import { initDebug } from "../../debug/debug.js";
import { exposeGlobals } from "../../debug/globals.js";
import { setDebugFlagsFromQuery } from "../../debug/setDebugFlagsFromQuery.js";
import { Level } from "../../main/Level.js";
import { LevelController } from "../../main/LevelController.js";
import { MenuController } from "../../main/main_menu/MenuController.js";
import { isMobile } from "../data/isMobile.js";
import { queryParams } from "../data/queryParams.js";


export async function initGame() {
    setDebugFlagsFromQuery();
    initDebug();
    exposeGlobals();
    console.log("Adding app to global");
    const app = new App(document.body);
    (globalThis as any).app = app;
    document.body.appendChild(app.pixiApp.view);
    app.pixiApp.view.focus();

    const levelName: string | undefined = queryParams["level"];
    if (levelName) {
        const level = Level.store.get(levelName);
        if (level) {
            if (isMobile()) {
                alert("Swipe to Move. Tap to Wait. Double Tap to Undo. Long Press to Pause.");
            } else {
                alert("WASD/Arrows to Move. Spacebar to Wait. Z to Undo. P to Pause.");
            }
            LevelController.load(level);
        }
    } else {
        MenuController.load();
    }
}