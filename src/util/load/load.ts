import { loadTextures } from "../../data/textures.js";

export async function load() {
    await loadTextures();
    const {initFiles} = await import("./initFiles.js");
    await initFiles();
    const {initGame} = await import("./initGame.js");
    await initGame();
}