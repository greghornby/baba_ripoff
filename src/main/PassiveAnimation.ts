import * as pixi from "pixi.js";
import { destroyAllChildren } from "../util/pixi/destroyAllChildren.js";
import { LevelController } from "./LevelController.js";

export class PassiveAnimation<M extends any = any> {

    public _destroyed: boolean = false;

    public container: pixi.Container;

    public containerX: number;
    public containerY: number;

    public framerate: number;

    public _timeConsideredAFrame: number;
    public _deltaTime: number = 0;

    public animationGenerator: PassiveAnimationFunction;
    public animationIterator?: Iterator<void, void, void>;
    public framesPassed: number = 0;

    constructor(public controller: LevelController, public data: PassiveAnimationData, public meta: M) {
        this.containerX = data.x;
        this.containerY = data.y;
        this.framerate = data.framerate;

        this.container = new pixi.Container();
        this.container.x = this.containerX;
        this.container.y = this.containerY;
        this.controller.container.addChild(this.container);

        this.animationGenerator = data.animation;

        this._timeConsideredAFrame = 1000 / this.framerate;
    }

    play(deltaTime: number) {
        if (this._destroyed) {
            return;
        }
        if (!this.animationIterator) {
            this.animationIterator = this.animationGenerator(this);
        }
        this._deltaTime += deltaTime;
        if (this._deltaTime > this._timeConsideredAFrame) {
            const result = this.animationIterator.next();
            if (result.done) {
                return this.destroy();
            }
            this._deltaTime %= this._timeConsideredAFrame;
        }
    }

    destroy() {
        destroyAllChildren(this.container);
        this.animationIterator = undefined;
        this._destroyed = true;
    }
}

export interface PassiveAnimationData {
    x: number;
    y: number;
    framerate: number;
    animation: PassiveAnimationFunction;
}

export type PassiveAnimationFunction = (passive: PassiveAnimation) => Generator<void, void, void>;