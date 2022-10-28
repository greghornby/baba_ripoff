import { App } from "../../app/App.js";
import { Level } from "../../classes/Level.js";
import { EditorController } from "../../controllers/EditorController.js";
import { LevelController } from "../../controllers/LevelController.js";
import { initDebug } from "../../debug/debug.js";
import { exposeGlobals } from "../../debug/globals.js";
import { setDebugFlagsFromQuery } from "../../debug/setDebugFlagsFromQuery.js";
import { MenuController } from "../../menu/MenuController.js";
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

    let level: Level | undefined;

    const levelName: string | undefined = queryParams["level"];
    const editorFlag: string | undefined = queryParams["editor"];
    if (levelName) {
        level = Level.store.get(levelName);
    } else if (editorFlag) {
        level = new Level(`${Math.random()}`, `Editor:${Math.random()}`, {
            width: 20,
            height: 20,
            startingEntities: () => ({
                grid: [],
                entitySetters: []
            })
        });

    }

    if (level) {
        // if (isMobile()) {
        //     alert("Swipe to Move. Tap to Wait. Double Tap to Undo. Long Press to Pause.");
        // } else {
        //     alert("WASD/Arrows to Move. Spacebar to Wait. Z to Undo. P to Pause. T to restart");
        // }
        if (editorFlag) {
            EditorController.load(level);
        } else {
            LevelController.load(level);
        }
    } else {
        MenuController.load();
    }
}