import * as pixi from "pixi.js";
import { getContainerToViewScale } from "./getContainerToViewScale.js";
import { getViewCenter } from "./getViewCenter.js";

export function fitContainerToView(
    container: pixi.Container,
    viewWidth: number,
    viewHeight: number,
    containerWidth: number,
    containerHeight: number
) {
    const viewCenter = getViewCenter();
    container.pivot.set(containerWidth/2, containerHeight/2);
    container.transform.position.set(...viewCenter);
    const scale = getContainerToViewScale(viewWidth, viewHeight, containerWidth, containerHeight);
    container.transform.scale.set(scale);
}