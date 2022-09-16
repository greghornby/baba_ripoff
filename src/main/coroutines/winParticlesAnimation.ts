import * as pixi from "pixi.js";
import { colors } from "../../objects/colors.js";
import { textures } from "../../objects/textures.js";
import { words } from "../../objects/words.js";
import { mapTextureToSheet } from "../../util/pixi/mapTextureToSheet.js";
import { Constants } from "../Constants.js";
import type { Entity } from "../Entity.js";
import type { Cell } from "../Level.js";
import { LevelController } from "../LevelController.js";


const frameRate = 5;
const frameDelta = 1000/frameRate;
const directions: [number, number][] = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
const TileSpriteNextSpawnTime: Map<Cell<Entity>, number> = new Map();

export function* winParticlesAnimation(controller: LevelController) {

    const sprites: Map<pixi.AnimatedSprite, {v: [number, number]}> = new Map();

    const particleContainer = controller.containers.particles;
    const tileSet: Set<Cell<Entity>> = new Set();
    let framesPassed = 0;
    let nextFrameTime = controller.timeElapsed + frameDelta;

    while (true) {
        yield;

        if (nextFrameTime > controller.timeElapsed) {
            framesPassed++;
            nextFrameTime = nextFrameTime + frameDelta;
        }

        const shrinkFrame = framesPassed % 15 === 0;

        for (const [sprite, data] of sprites) {
            sprite.x += data.v[0];
            sprite.y += data.v[1];
            if (shrinkFrame) {
                const f = sprite.currentFrame + 1;
                if (f >= sprite.totalFrames) {
                    sprites.delete(sprite);
                    sprite.parent.removeChild(sprite);
                    sprite.destroy();
                } else {
                    sprite.gotoAndStop(f);
                }
            }
        }

        const winEntities = controller.getEntitiesByTag(words.win);
        tileSet.clear();

        //create set of win tiles
        for (const e of winEntities) {
            tileSet.add(controller.getEntitiesAtPosition(e.x, e.y) as Cell<Entity>);
        }

        for (const [tile] of TileSpriteNextSpawnTime) {
            if (!tileSet.has(tile)) {
                TileSpriteNextSpawnTime.delete(tile);
            }
        }

        //try spawn new particles at win tiles
        for (const tile of tileSet) {
            const sprite = tryCreateSpriteAtTile(tile, controller.timeElapsed);
            if (!sprite) {
                continue;
            }
            const {x,y} = tile[0];
            sprite.transform.position.set(x*Constants.TILE_SIZE,y*Constants.TILE_SIZE);
            const speed = 0.5;
            const trajectory = randomDirection();
            const indexToAffect: 0 | 1 = trajectory[0] && trajectory[1] ? random0Or1() : trajectory[0] ? 0 : 1;
            trajectory[indexToAffect] *= randomAbove0point5();
            trajectory[0] *= speed;
            trajectory[1] *= speed;
            sprites.set(sprite, {v: trajectory});
            particleContainer.addChild(sprite);
        }
    }

}

function randomDirection(): [number, number] {
    return [...directions[Math.floor(Math.random()*directions.length)]];
}

function tryCreateSpriteAtTile(tile: Cell<Entity>, timeElapsed: number): pixi.AnimatedSprite | undefined  {
    let fetchNextSpawnTime = TileSpriteNextSpawnTime.get(tile);
    //not ready to spawn
    if (fetchNextSpawnTime && timeElapsed < fetchNextSpawnTime) {
        return;
    }
    const nextTime = (fetchNextSpawnTime ?? timeElapsed) + (Math.random() * 600 + 400); //in the next 0.5 to 1.5 seconds
    TileSpriteNextSpawnTime.set(tile, nextTime);
    //hasn't been set before now, so set it and return
    if (!fetchNextSpawnTime) {
        return;
    }
    const sprite = new pixi.AnimatedSprite(
        mapTextureToSheet.get(textures.animations.WinParticle)!.animations.main,
        false
    );
    sprite.tint = colors.paleGold;
    return sprite;
}

function random0Or1(): 0 | 1 {
    return Math.random() > 0.5 ? 0 : 1;
}
function randomAbove0point5(): number {
    return Math.random() * 0.5 + 0.5;
}