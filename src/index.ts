import { initFiles } from "./util/initFiles.js";
initFiles();
import { initDebug } from "./debug/debug.js";
import { exposeGlobals } from "./debug/globals.js";
import { level01 } from "./levels/level01.js";
import { App } from "./main/App.js";

function initGame() {
    initDebug();
    exposeGlobals();
    console.log("Adding app to global");
    const app = new App(document.body);
    (globalThis as any).app = app;
    document.body.appendChild(app.pixiApp.view);
    app.pixiApp.view.focus();
    const level = level01();
    level.load();
    if (isMobile()) {
        alert("Swipe to move. Double Tap to undo");
    } else {
        alert("WASD/Arrows to move. Z to undo");
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", initGame);