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
    public color: number | undefined;
    public x: number;
    public y: number;
    public facing: Facing;
    public isActiveText: boolean;

    public pixiContainer: pixi.Container;
    private cancelledTextGraphic: pixi.Graphics | undefined;
    private pixiSprite: pixi.Sprite;
    private colorPixiFilter: ColorMatrixFilter;
    private activeTextPixiFilter: ColorMatrixFilter;

    public _animation: EntityAnimation | undefined;

    public _debug: {
        idGraphic?: pixi.Graphics;
        facingGraphic?: pixi.Graphics;
    } = {};

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
        this.pixiContainer.sortableChildren = true;
        this.pixiSprite = new pixi.Sprite();
        this.pixiSprite.zIndex = 0;
        this.pixiContainer.addChild(this.pixiSprite);
        this.colorPixiFilter = new pixi.filters.ColorMatrixFilter();
        this.activeTextPixiFilter = new pixi.filters.ColorMatrixFilter();
        this.pixiSprite.filters = [
            this.colorPixiFilter,
            this.activeTextPixiFilter
        ];
        this.setSpriteInfo();
        this.setColor(undefined);
        this.setActiveTextSprite(this.isActiveText);
        this.setFacing(this.facing = Facing.down);
        this.setSpritePosition();
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


    public setCancelledWord(cancelled: boolean): void {
        if (!(this.construct instanceof Word)) {
            return;
        }
        if (!this.cancelledTextGraphic) {
            this.cancelledTextGraphic = new pixi.Graphics();
            this.cancelledTextGraphic.zIndex = 100;
            this.pixiContainer.addChild(this.cancelledTextGraphic);
            const half = this.level.TILE_SIZE/2;
            const quarter = half/2;

            const g = this.cancelledTextGraphic;
            g.lineStyle(5, 0xff0000);
            g.moveTo(half - quarter, half - quarter);
            g.lineTo(half + quarter, half + quarter);
            g.moveTo(half + quarter, half - quarter);
            g.lineTo(half - quarter, half + quarter);
        }
        this.cancelledTextGraphic.visible = cancelled;

    }


    //#region debug


    public _removeDebugContainers(...containers: (pixi.Container | undefined)[]) {
        for (const c of containers) {
            if (c) {
                this.pixiContainer.removeChild(c);
                c.destroy();
            }
        }
    }


    public _debugFacingGraphic(): void {
        if (!debugFlags.drawFacingArrows) {
            this._removeDebugContainers(this._debug.facingGraphic);
            this._debug.facingGraphic = undefined;
            return;
        }
        if (!this._debug.facingGraphic) {
            this._debug.facingGraphic = new pixi.Graphics();
            this._debug.facingGraphic.zIndex = 101;
            this.pixiContainer.addChild(this._debug.facingGraphic);
        }

        this._debug.facingGraphic.clear();
        if (!debugFlags.drawFacingArrows) {
            return;
        }
        this._debug.facingGraphic.lineStyle(2, 0x00ff00, 1.0);
        const half = this.level.TILE_SIZE/2;
        const quarter = this.level.TILE_SIZE/4;
        const points = {
            up: [half, half - quarter] as [number, number],
            down: [half, half + quarter] as [number, number],
            left: [half - quarter, half] as [number, number],
            right: [half + quarter, half] as [number, number],
        };

        let toDraw: [number, number][];
        switch (this.facing) {
            case Facing.right: toDraw = [points.up, points.right, points.down]; break;
            case Facing.left: toDraw = [points.up, points.left, points.down]; break;
            case Facing.down: toDraw = [points.left, points.down, points.right]; break;
            case Facing.up: toDraw = [points.left, points.up, points.right]; break;
        }

        for (const [index, point] of toDraw.entries()) {
            if (index === 0) {
                this._debug.facingGraphic.moveTo(...point);
            } else {
                this._debug.facingGraphic.lineTo(...point);
            }
        }
    }


    public _debugEntityId(): void {
        if (!debugFlags.drawEntityIds) {
            this._removeDebugContainers(this._debug.idGraphic);
            this._debug.idGraphic = undefined;
            return;
        }
        if (this._debug.idGraphic) {
            return;
        }
        this._debug.idGraphic = new pixi.Graphics();
        this._debug.idGraphic.zIndex = 102;
        this.pixiContainer.addChild(this._debug.idGraphic);
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
        this._debug.idGraphic.addChild(bg);
        this._debug.idGraphic.addChild(text);
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