import { Entity } from "./Entity.js";

export class EntityAnimation {

    public frames: AnimationFrame[] = [];
    public currentFrameIndex: number = -1;
    public ended: boolean = false;

    constructor(
        public entity: Entity
    ) {}


    getNextFrame(): AnimationFrame | undefined {
        this.currentFrameIndex++;
        const frame = this.frames[this.currentFrameIndex] as AnimationFrame | undefined;
        if (!frame) {
            this.ended =  true;
        }
        return frame;
    }

    addMotionSlide(data: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        frames: number;
    }) {
        const {startX, startY, endX, endY, frames} = data;
        const xDiff = (endX - startX) / frames;
        const yDiff = (endY - startY) / frames;

        for (let f = 0; f < frames; f++) {
            const isLastFrame = f === frames - 1;
            const fx = isLastFrame ? endX : startX + (f * xDiff);
            const fy = isLastFrame ? endY : startY + (f * yDiff);
            const frame: AnimationFrame = {
                x: fx,
                y: fy,
            };
            this.frames.push(frame);
        }
    }
}

export interface AnimationFrame {
    x: number;
    y: number;
}