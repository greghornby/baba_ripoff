import * as pixi from "pixi.js";

export function getContainerCenter(container: pixi.Container): [x: number, y: number] {
    return [container.width/2, container.height/2];
}