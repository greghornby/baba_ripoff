import * as pixi from "pixi.js";

export function destroyAllChildren(container: pixi.Container | pixi.DisplayObject) {
    if ((container as pixi.Container).children) {
        for (const child of (container as pixi.Container).children) {
            destroyAllChildren(child);
        }
    }
    container.destroy();
}