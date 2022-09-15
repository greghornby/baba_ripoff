import * as pixi from "pixi.js";
import { LevelController } from "../main/LevelController.js";
import { PassiveAnimation, PassiveAnimationData, PassiveAnimationFunction } from "../main/PassiveAnimation.js";
import { colors } from "../objects/colors.js";
import { textures } from "../objects/textures.js";
import { arrayRemoveParallel } from "../util/data/arrayRemoveParallel.js";
import { mapTextureToSheet } from "../util/pixi/mapTextureToSheet.js";


export class WinPassiveAnimation extends PassiveAnimation<{x: number; y: number}> {
    framerate = 5;
    constructor(
        public controller: LevelController,
        public data: PassiveAnimationData,
        public meta: {x: number; y: number},
    ) {
        super(controller, data, meta, win_anim);
    }
}


const MAX_SPRITES = 3;
const directions: [number, number][] = [
    [-1,-1], [0, -1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1,0]
];
export const win_anim: PassiveAnimationFunction = function*(passive) {

    const sprites: pixi.AnimatedSprite[] = [];
    const trajectories: [number,number][] = [];
    const parallel: [typeof sprites, typeof trajectories] = [sprites, trajectories];

    const markedForRemoval: pixi.AnimatedSprite[] = [];
    const passiveContainer = passive.container;
    main:
    while (true) {
        yield;

        const shrinkFrame = passive.framesPassed % 3 === 0;

        markedForRemoval.length = 0;
        for (let i = 0; i < sprites.length; i++) {
            const sprite = sprites[i];
            const trajectory = trajectories[i];
            sprite.x += trajectory[0];
            sprite.y += trajectory[1];
            if (shrinkFrame) {
                const f = sprite.currentFrame + 1;
                if (f >= sprite.totalFrames) {
                    markedForRemoval.push(sprite);
                } else {
                    sprite.gotoAndStop(f);
                }
            }
        }
        if (markedForRemoval.length) {
            for (const sprite of markedForRemoval) {
                passiveContainer.removeChild(sprite);
                sprite.destroy();
            }
            arrayRemoveParallel(parallel, ...markedForRemoval);
        }
        if (sprites.length >= MAX_SPRITES) {
            continue main;
        }

        const rng = Math.random();
        if (rng > 0.25) {
            continue main;
        }

        const newSprite = new pixi.AnimatedSprite(
            mapTextureToSheet.get(textures.animations.WinParticle)!.animations.main,
            false
        );
        const filter = new pixi.filters.ColorMatrixFilter();
        filter.tint(colors.paleGold);
        newSprite.filters = [filter];
        const speed = 10;
        const direction: [number, number] = [...directions[Math.floor(Math.random() * directions.length)]];
        direction[0] *= speed;
        direction[1] *= speed;
        sprites.push(newSprite);
        trajectories.push(direction);
        passiveContainer.addChild(newSprite);
    }
}