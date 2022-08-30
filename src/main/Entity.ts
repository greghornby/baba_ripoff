import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";
import { Facing } from "../types/Facing.js";
import { EntityAnimation } from "./EntityAnimation.js";
import { debugFlags } from "../debug/debugFlags.js";

export class Entity {

    public id: number;
    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public pixiSprite: pixi.Sprite;
    public color: number | undefined;
    public x: number;
    public y: number;
    public facing: Facing;

    public _animation: EntityAnimation | undefined;

    public _facingGraphic: pixi.Graphics;

    constructor(public initData: InitAbstractObjectData) {
        const associatedWord = initData.construct.associatedWord()._string;
        this.name = initData.construct instanceof Word ? `text:${associatedWord}` : associatedWord;
        this.level = initData.level;
        this.controller = initData.controller;
        this.construct = initData.construct;
        this.x = initData.x;
        this.y = initData.y;
        this.pixiSprite = new pixi.Sprite();
        this.updateColor(undefined);
        this._facingGraphic = new pixi.Graphics();
        this.pixiSprite.addChild(this._facingGraphic);

        this.facing = Facing.down;
        this.setFacing(this.facing);

        this.id = this.controller.entityCount++;

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
        this.pixiSprite.zIndex = construct.category.zIndex;
    }


    public updateColor(color: number | undefined) {
        this.color = color;
        const filter = new pixi.filters.ColorMatrixFilter();
        if (color) {
            filter.tint(color);
        } else {
            filter.tint(this.construct.defaultColor);
        }
        this.pixiSprite.filters = [filter];
    }


    public setFacing(facing: Facing) {
        this.facing = facing;
        this._facingGraphic.clear();
        if (!debugFlags.drawFacingArrows) {
            return;
        }
        this._facingGraphic.lineStyle(2, 0xff0000, 1.0);
        const half = this.level.TILE_SIZE/2;
        const quarter = this.level.TILE_SIZE/4;
        const points = {
            up: [half, half - quarter] as [number, number],
            down: [half, half + quarter] as [number, number],
            left: [half - quarter, half] as [number, number],
            right: [half + quarter, half] as [number, number],
        };

        let toDraw: [number, number][];
        switch (facing) {
            case Facing.right: toDraw = [points.up, points.right, points.down]; break;
            case Facing.left: toDraw = [points.up, points.left, points.down]; break;
            case Facing.down: toDraw = [points.left, points.down, points.right]; break;
            case Facing.up: toDraw = [points.left, points.up, points.right]; break;
        }

        for (const [index, point] of toDraw.entries()) {
            if (index === 0) {
                this._facingGraphic.moveTo(...point);
            } else {
                this._facingGraphic.lineTo(...point);
            }
        }
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