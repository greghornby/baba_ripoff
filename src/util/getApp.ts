import * as pixi from "pixi.js";

const app = new pixi.Application({
    width: 960,
    height: 600
});

export const getApp = (): pixi.Application => {
    return app;
}