import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";
import { Facing } from "../types/Facing.js";
import { EntityPixi } from "./EntityPixi.js";

export class Entity {

    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public color: number;
    public x: number;
    public y: number;
    public facing: Facing;
    public isActiveText?: boolean;
    public isCancelledText?: boolean;

    public entityPixi: EntityPixi;

    // public _animation: EntityAnimation | undefined;

    public _debug: {
        idGraphic?: pixi.Graphics;
        redrawFacing?: boolean;
        facingGraphic?: pixi.Graphics;
    } = {};

    constructor(public readonly id: number, public initData: EntityInitData) {
        const associatedWord = initData.construct.associatedWord()._string;
        this.name = initData.construct instanceof Word ? `text:${associatedWord}` : associatedWord;
        this.level = initData.level;
        this.controller = initData.controller;
        this.construct = initData.construct;
        this.x = initData.x;
        this.y = initData.y;
        this.color = initData.construct.defaultColor;
        this.facing = Facing.down;

        this.entityPixi = new EntityPixi(this);

        this.setActiveText(false);
        this.setCancelledWord(false);
    }


    public setColor(color: number | undefined) {
        this.color = color ?? this.construct.defaultColor;
        this.entityPixi.setColor(this.color);
    }


    public setFacing(facing: Facing) {
        this.facing = facing;
        this.entityPixi.setFacing(this.facing);
        this._debug.redrawFacing = true;
    }


    public setActiveText(active: boolean): void {
        if (!(this.construct instanceof Word)) {
            return;
        }
        if (this.isActiveText === active) {
            return;
        }
        this.isActiveText = active;
        this.entityPixi.setTextFilter(this.isActiveText);
    }


    public setCancelledWord(cancelled: boolean): void {
        if (!(this.construct instanceof Word)) {
            return;
        }
        if (this.isCancelledText === cancelled) {
            return;
        }
        this.isCancelledText = cancelled;
        this.entityPixi.setWordCancelled(this.isCancelledText);
    }


    // //#region debug


    // public _removeDebugContainers(...containers: (pixi.Container | undefined)[]) {
    //     for (const c of containers) {
    //         if (c) {
    //             this.pixiContainer.removeChild(c);
    //             c.destroy();
    //         }
    //     }
    // }


    // public _debugFacingGraphic(): void {
    //     if (!debugFlags.drawFacingArrows) {
    //         this._removeDebugContainers(this._debug.facingGraphic);
    //         this._debug.facingGraphic = undefined;
    //         return;
    //     }
    //     if (!this._debug.redrawFacing) {
    //         return;
    //     }
    //     this._debug.redrawFacing = false;

    //     if (!this._debug.facingGraphic) {
    //         this._debug.facingGraphic = new pixi.Graphics();
    //         this._debug.facingGraphic.zIndex = 101;
    //         this.pixiContainer.addChild(this._debug.facingGraphic);
    //     }

    //     this._debug.facingGraphic.clear();
    //     this._debug.facingGraphic.lineStyle(2, 0x00ff00, 1.0);
    //     const half = this.level.TILE_SIZE/2;
    //     const quarter = this.level.TILE_SIZE/4;
    //     const points = {
    //         up: [half, half - quarter] as [number, number],
    //         down: [half, half + quarter] as [number, number],
    //         left: [half - quarter, half] as [number, number],
    //         right: [half + quarter, half] as [number, number],
    //     };

    //     let toDraw: [number, number][];
    //     switch (this.facing) {
    //         case Facing.right: toDraw = [points.up, points.right, points.down]; break;
    //         case Facing.left: toDraw = [points.up, points.left, points.down]; break;
    //         case Facing.down: toDraw = [points.left, points.down, points.right]; break;
    //         case Facing.up: toDraw = [points.left, points.up, points.right]; break;
    //     }

    //     for (const [index, point] of toDraw.entries()) {
    //         if (index === 0) {
    //             this._debug.facingGraphic.moveTo(...point);
    //         } else {
    //             this._debug.facingGraphic.lineTo(...point);
    //         }
    //     }
    //     this.cacheContainer();
    // }


    // public _debugEntityId(): void {
    //     if (!debugFlags.drawEntityIds) {
    //         this._removeDebugContainers(this._debug.idGraphic);
    //         this._debug.idGraphic = undefined;
    //         return;
    //     }
    //     if (this._debug.idGraphic) {
    //         return;
    //     }
    //     this._debug.idGraphic = new pixi.Graphics();
    //     this._debug.idGraphic.zIndex = 102;
    //     this.pixiContainer.addChild(this._debug.idGraphic);
    //     const text = new pixi.Text(this.id, new pixi.TextStyle({
    //         fontFamily : 'Arial',
    //         fontSize: 12,
    //         fill : 0xffffff,
    //         align : 'left'
    //     }));
    //     const bounds = text.getBounds();
    //     const bg = new pixi.Graphics();
    //     bg.beginFill(0x000000);
    //     bg.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    //     this._debug.idGraphic.addChild(bg);
    //     this._debug.idGraphic.addChild(text);
    //     this.cacheContainer();
    // }
}

export interface EntityInitData {
    level: Level;
    controller: LevelController;
    construct: Construct;
    x: number;
    y: number;
}