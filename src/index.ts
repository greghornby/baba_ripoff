import { App } from "./app/App.js";
import { initDebug } from "./debug/debug.js";
import { exposeGlobals } from "./debug/globals.js";
import { setDebugFlagsFromQuery } from "./debug/setDebugFlagsFromQuery.js";
import { isMobile } from "./util/data/isMobile.js";
import { initFiles } from "./util/temp/initFiles.js";
import { loadLevel } from "./util/temp/tempWinScreen.js";
initFiles();

function initGame() {
    setDebugFlagsFromQuery();
    initDebug();
    exposeGlobals();
    console.log("Adding app to global");
    const app = new App(document.body);
    (globalThis as any).app = app;
    document.body.appendChild(app.pixiApp.view);
    app.pixiApp.view.focus();
    loadLevel();
    if (isMobile()) {
        alert("Swipe to Move. Tap to Wait. Double Tap to Undo");
    } else {
        alert("WASD/Arrows to Move. Spacebar to Wait. Z to Undo");
    }
}



document.addEventListener("DOMContentLoaded", initGame);