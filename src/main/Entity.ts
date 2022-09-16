import * as pixi from "pixi.js";
import { Direction } from "../types/Direction.js";
import { Construct } from "./Construct.js";
import { EntityPixi } from "./EntityPixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";

export class Entity {

    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public color: number;
    public x: number;
    public y: number;
    public facing: Direction;
    public isActiveText?: boolean;
    public isCancelledText?: boolean;

    public entityPixi: EntityPixi;

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
        this.facing = Direction.down;

        this.entityPixi = new EntityPixi(this);

        this.setActiveText(false);
        this.setCancelledWord(false);
    }


    public setColor(color: number | undefined) {
        this.color = color ?? this.construct.defaultColor;
        this.entityPixi.setColor(this.color);
    }


    public setFacing(facing: Direction) {
        this.facing = facing;
        this.entityPixi.setFacing();
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
}

export interface EntityInitData {
    level: Level;
    controller: LevelController;
    construct: Construct;
    x: number;
    y: number;
}