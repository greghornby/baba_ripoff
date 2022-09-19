import * as pixi from "pixi.js";
import { getContainerCenter } from "./getContainerCenter.js";

export function pivotToCenter(container: pixi.Container) {
    container.pivot.set(...getContainerCenter(container));
}