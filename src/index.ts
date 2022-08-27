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
    const level = level01();
    level.load();
}

document.addEventListener("DOMContentLoaded", initGame);