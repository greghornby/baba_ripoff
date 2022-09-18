import { App } from "../../app/App.js";
import { initDebug } from "../../debug/debug.js";
import { exposeGlobals } from "../../debug/globals.js";
import { setDebugFlagsFromQuery } from "../../debug/setDebugFlagsFromQuery.js";
import { MenuController } from "../../main/MenuController.js";


export async function initGame() {
    setDebugFlagsFromQuery();
    initDebug();
    exposeGlobals();
    console.log("Adding app to global");
    const app = new App(document.body);
    (globalThis as any).app = app;
    document.body.appendChild(app.pixiApp.view);
    app.pixiApp.view.focus();
    MenuController.load();
    // loadLevel();
    // if (isMobile()) {
    //     alert("Swipe to Move. Tap to Wait. Double Tap to Undo. Long Press to Pause.");
    // } else {
    //     alert("WASD/Arrows to Move. Spacebar to Wait. Z to Undo. P to Pause.");
    // }
}