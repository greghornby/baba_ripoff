import { level01 } from "./levels/level01.js";
import { getApp } from "./util/getApp.js";

function initGame() {
    const app = getApp();
    document.body.appendChild(app.view);
    const level = level01;
    level.load();
}

document.addEventListener("DOMContentLoaded", initGame);