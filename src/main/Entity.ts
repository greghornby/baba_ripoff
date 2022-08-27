import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";
import { Facing } from "../types/Facing.js";

export class Entity {

    public name: string;
    public construct: Construct;
    public level: Level;
    public controller: LevelController;
    public pixiSprite: pixi.Sprite;
    public x: number;
    public y: number;
    public facing: Facing;

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


    removeFromLevel(options: {noArrayMutations: boolean}) {
        this.controller.container.removeChild(this.pixiSprite);
        if (!options.noArrayMutations) {
            this.controller.entitySet.delete(this);
            this.pixiSprite.destroy();
        }
    }


    updateConstruct(construct: Construct) {
        this.construct = construct;
        this.pixiSprite.texture = construct.texture;
    }


    public updateSpriteScreenPosition() {
        console.log(`Drawing ${this.construct.constructor.name} at ${this.x} ${this.y}`);
        this.pixiSprite.transform.position.x = this.x * this.level.TILE_SIZE;
        this.pixiSprite.transform.position.y = this.y * this.level.TILE_SIZE;
    }
}

export interface InitAbstractObjectData {
    level: Level;
    controller: LevelController;
    construct: Construct;
    x: number;
    y: number;
}