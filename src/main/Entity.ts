import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";
import { Facing } from "../types/Facing.js";
import { EntityAnimation } from "./EntityAnimation.js";
import { debugFlags } from "../debug/debugFlags.js";

export class Entity {

    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public pixiContainer: pixi.Container;
    private pixiSprite: pixi.Sprite;
    public color: number | undefined;
    public colorPixiFilter: ColorMatrixFilter;
    public activeTextPixiFilter: ColorMatrixFilter;
    public x: number;
    public y: number;
    public facing: Facing;
    public isActiveText: boolean;

    public _animation: EntityAnimation | undefined;

    public _facingGraphic: pixi.Graphics;

    constructor(public id: number, public initData: EntityInitData) {
        const associatedWord = initData.construct.associatedWord()._string;
        this.name = initData.construct instanceof Word ? `text:${associatedWord}` : associatedWord;
        this.level = initData.level;
        this.controller = initData.controller;
        this.construct = initData.construct;
        this.x = initData.x;
        this.y = initData.y;
        this.isActiveText = false;

        this.pixiContainer = new pixi.Container();
        this.pixiSprite = new pixi.Sprite();
        this.pixiContainer.addChild(this.pixiSprite);
        this.colorPixiFilter = new pixi.filters.ColorMatrixFilter();
        this.activeTextPixiFilter = new pixi.filters.ColorMatrixFilter();
        this.pixiSprite.filters = [
            this.colorPixiFilter,
            this.activeTextPixiFilter
        ];
        this.colorPixiFilter.tint
        this._facingGraphic = new pixi.Graphics();
        this.pixiContainer.addChild(this._facingGraphic);
        this.setSpriteInfo();
        this.setColor(undefined);
        this.setActiveTextSprite(this.isActiveText);
        this.setFacing(this.facing = Facing.down);
        this.setSpritePosition();
        this.drawEntityId();
    }


    public setSpriteInfo() {
        this.pixiSprite.texture = this.construct.texture;
        this.pixiContainer.zIndex = this.construct.category.zIndex;
    }


    public setColor(color: number | undefined) {
        this.color = color;
        this.colorPixiFilter.reset();
        if (color) {
            this.colorPixiFilter.tint(color);
        } else {
            this.colorPixiFilter.tint(this.construct.defaultColor);
        }
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


    public drawEntityId(): void {
        if (!debugFlags.drawEntityIds) {
            return;
        }
        const text = new pixi.Text(this.id, new pixi.TextStyle({
            fontFamily : 'Arial',
            fontSize: 12,
            fill : 0xffffff,
            align : 'left'
        }));
        const bounds = text.getBounds();
        const bg = new pixi.Graphics();
        bg.beginFill(0x000000);
        bg.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.pixiContainer.addChild(bg);
        this.pixiContainer.addChild(text);
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

        this.setSpritePosition(frame.x, frame.y);
    }


    public setSpritePosition(): void;
    public setSpritePosition(x: number, y: number): void;
    public setSpritePosition(_x?: number, _y?: number) {
        const [x, y] = [_x ?? this.x, _y ?? this.y];
        this.pixiContainer.transform.position.x = x * this.level.TILE_SIZE;
        this.pixiContainer.transform.position.y = y * this.level.TILE_SIZE;
    }


    public setActiveTextSprite(active: boolean): void {
        this.isActiveText = active;
        if (!(this.construct instanceof Word)) {
            return;
        }
        this.activeTextPixiFilter.reset();
        if (!active) {
            this.activeTextPixiFilter.brightness(0.5, false);
        }
    }
}

export interface EntityInitData {
    level: Level;
    controller: LevelController;
    construct: Construct;
    x: number;
    y: number;
}

type ColorMatrixFilter = InstanceType<typeof pixi.filters["ColorMatrixFilter"]>;