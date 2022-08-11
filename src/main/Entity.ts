import { Construct } from "./Construct.js";
import * as pixi from "pixi.js";
import { Level } from "./Level.js";

export class Entity {

    public construct: Construct;
    public level: Level;
    public pixiSprite: pixi.Sprite;
    public x: number;
    public y: number;

    constructor(public initData: InitAbstractObjectData) {
        this.level = initData.level;
        this.construct = initData.construct;
        this.x = initData.x;
        this.y = initData.y;
        this.pixiSprite = new pixi.Sprite();

        this.updateConstruct(this.construct);
        this.level.container.addChild(this.pixiSprite);
        this.level.entities.add(this);
        this.updateSpriteScreenPosition();
    }


    updateConstruct(construct: Construct) {
        this.construct = construct;
        this.pixiSprite.texture = construct.pixiTexture;
    }


    public updateSpriteScreenPosition() {
        console.log(`Drawing ${this.construct.constructor.name} at ${this.x} ${this.y}`);
        this.pixiSprite.transform.position.x = this.x * this.level.TILE_SIZE;
        this.pixiSprite.transform.position.y = this.y * this.level.TILE_SIZE;
    }
}

export interface InitAbstractObjectData {
    level: Level;
    construct: Construct;
    x: number;
    y: number;
}