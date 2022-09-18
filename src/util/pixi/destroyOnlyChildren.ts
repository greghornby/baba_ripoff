import * as pixi from "pixi.js";
import { destroyContainerAndAllChildren } from "./destroyContainerAndAllChildren.js";

export function destroyOnlyChildren(container: pixi.Container | pixi.DisplayObject) {
    if ((container as pixi.Container).children) {
        const children = (container as pixi.Container).children;
        const len = children.length;
        for (let i = len - 1; i > -1; i--) {
            const child = children[i];
            destroyContainerAndAllChildren(child);
        }
    }
}