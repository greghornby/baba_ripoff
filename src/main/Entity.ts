import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";
import { Facing } from "../types/Facing.js";
import { EntityAnimation } from "./EntityAnimation.js";

export class Entity {

    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public pixiSprite: pixi.Sprite;
    public x: number;
    public y: number;
    public facing: Facing;

    public _animation: EntityAnimation | undefined;

    constructor(public initData: InitAbstractObjectData) {
        const associatedWord = initData.construct.associatedWord()._string;
        this.name = initData.construct instanceof Word ? `text:${associatedWord}` : associatedWord;
        this.level = initData.level;
        this.controller = initData.controller;
        this.construct = initData.construct;
        this.x = initData.x;
        this.y = initData.y;
        this.pixiSprite = new pixi.Sprite();

        this.facing = Facing.down;

        this.updateConstruct(this.construct);
        this.controller.container.addChild(this.pixiSprite);
        this.controller.entitySet.add(this);
        this.updateSpriteScreenPosition();
    }


    public removeFromLevel(options: {noArrayMutations: boolean}) {
        this.controller.container.removeChild(this.pixiSprite);
        if (!options.noArrayMutations) {
            this.controller.entitySet.delete(this);
            this.pixiSprite.destroy();
        }
    }


    public updateConstruct(construct: Construct) {
        this.construct = construct;
        this.pixiSprite.texture = construct.texture;
    }


    public animation(): EntityAnimation {
        const animation = this._animation ?? new EntityAnimation(this);
        this._animation = animation;
        this.controller.entitiesToAnimate.add(this);
        return this._animation;
    }


    public renderNextAnimationFrame(): void {

        if (!this._animation) {
            return;
        }

        const frame = this._animation.getNextFrame();
        if (this._animation.ended || !frame) {
            this._animation = undefined;
            this.controller.entitiesToAnimate.delete(this);
            return;
        }

        this.updateSpriteScreenPosition(frame.x, frame.y);
    }


    public updateSpriteScreenPosition(): void;
    public updateSpriteScreenPosition(x: number, y: number): void;
    public updateSpriteScreenPosition(_x?: number, _y?: number) {
        const [x, y] = [_x ?? this.x, _y ?? this.y];
        this.pixiSprite.transform.position.x = x * this.level.TILE_SIZE;
        this.pixiSprite.transform.position.y = y * this.level.TILE_SIZE;
    }
}

export interface InitAbstractObjectData {
    level: Level;
    controller: LevelController;
    construct: Construct;
    x: number;
    y: number;
}