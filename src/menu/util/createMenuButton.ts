import * as pixi from "pixi.js";

export function createMenuButton(options: {
    width: number;
    height: number;
    fillColor: number;
    borderColor: number;
    borderThickness?: number;
    borderRadius?: number;
    action?: () => void;
}): pixi.Container {
    const container = new pixi.Container();
    container.interactive = true;
    container.buttonMode = true;
    if (options.action) {
        container.on("pointertap", options.action);
    }
    const bg = new pixi.Graphics();
    container.addChild(bg);
    bg.beginFill(options.fillColor);
    bg.drawRect(0, 0, options.width, options.height);
    bg.endFill();
    bg.lineStyle(options.borderThickness ?? 4, options.borderColor);
    bg.drawRoundedRect(0, 0, options.width, options.height, options.borderRadius ?? 3);
    return container;
}