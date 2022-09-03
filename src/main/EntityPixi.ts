import * as pixi from "pixi.js";
import { Facing } from "../types/Facing.js";
import { App } from "./App.js";
import { Entity } from "./Entity.js";
import { LevelController } from "./LevelController.js";

export class EntityPixi {

    public entityId: number;
    public controller: LevelController;
    public destroyed: boolean = false;
    public cacheEnabled: boolean = false;

    public container: pixi.Container;
    public sprite: pixi.Sprite;
    public cancelledSprite: pixi.Graphics | undefined;
    public filterColor: ColorMatrixFilter;
    public textFilter: ColorMatrixFilter;

    public _visible: boolean = true;
    public _invisiblePosition = {x: 0, y: 0};

    constructor(entity: Entity) {
        this.entityId = entity.id;
        this.controller = entity.controller;
        this.container = new pixi.Container();
        this.container.sortableChildren = true;
        this.container.zIndex = entity.construct.category.zIndex;
        this.container.transform.pivot.set(this.controller.level.TILE_SIZE/2, this.controller.level.TILE_SIZE/2);
        this.sprite = new pixi.Sprite(entity.construct.texture);
        this.container.addChild(this.sprite);
        this.filterColor = new pixi.filters.ColorMatrixFilter();
        this.textFilter = new pixi.filters.ColorMatrixFilter();
        this.sprite.filters = [
            this.filterColor,
            this.textFilter
        ];
        this.setColor(entity.color ?? entity.construct.defaultColor);
        this.setFacing(entity.facing);
        this.setPosition(entity.x, entity.y);
        this.cacheEnabled = true;
        this.cache();
    }


    @pixiUpdate()
    public cache(): void {
        if (this.cacheEnabled) {
            this.container.cacheAsBitmap = false;
            this.container.cacheAsBitmap = true;
        } else {
            this.container.cacheAsBitmap = false;
        }
    }


    public destroy(): void {
        if (this.destroyed) {
            return;
        }
        this.container.destroy();
        this.sprite.destroy();
        this.cancelledSprite?.destroy();
        this.removeContainerFromController();
    }


    public addContainerToController(): void {
        if (this.destroyed) {
            return;
        }
        this.controller.container.addChild(this.container);
    }


    public removeContainerFromController(): void {
        if (this.destroyed) {
            return;
        }
        this.controller.container.removeChild(this.container);
    }


    @pixiUpdate()
    public setColor(color: number) {
        this.filterColor.reset();
        this.filterColor.tint(color);
    }


    @pixiUpdate({noCache: true})
    public setVisible(visible: boolean) {
        this._visible = visible;
        if (!visible) {
            this._invisiblePosition.x = this.container.transform.position.x;
            this._invisiblePosition.y = this.container.transform.position.y;
            const app = App.get();
            const bounds = app.pixiApp.stage.getBounds();
            this.container.transform.position.set(-this.controller.level.TILE_SIZE, -this.controller.level.TILE_SIZE);
        } else {
            this.container.transform.position.set(
                this._invisiblePosition.x,
                this._invisiblePosition.y
            );
        }
    }


    @pixiUpdate()
    public setFacing(facing: Facing): void {

    }


    @pixiUpdate({noCache: true})
    setPosition(x?: number, y?: number): void {
        const m = this.controller.level.TILE_SIZE;
        const _x = (x !== undefined ? x*m : this.container.transform.position.x) + this.controller.level.TILE_SIZE / 2;
        const _y = (y !== undefined ? y*m : this.container.transform.position.y)  + this.controller.level.TILE_SIZE / 2;
        if (this._visible) {
            this.container.transform.position.set(_x, _y);
        }
        this._invisiblePosition.x = _x;
        this._invisiblePosition.y = _y;
    }


    @pixiUpdate({noCache: true})
    setScale(x?: number, y?: number): void {
        this.container.transform.scale.set(
            x ?? this.container.transform.scale.x,
            y ?? this.container.transform.scale.y
        );
    }


    @pixiUpdate()
    setTextFilter(active: boolean): void {
        this.textFilter.reset();
        if (!active) {
            this.textFilter.brightness(0.5, false);
        }
    }


    @pixiUpdate()
    setWordCancelled(cancelled: boolean): void {
        if (!this.cancelledSprite) {
            this.cancelledSprite = new pixi.Graphics();
            this.cancelledSprite.zIndex = 100;
            this.container.addChild(this.cancelledSprite);
            const half = this.controller.level.TILE_SIZE/2;
            const quarter = half/2;

            const g = this.cancelledSprite;
            g.lineStyle(5, 0xff0000);
            g.moveTo(half - quarter, half - quarter);
            g.lineTo(half + quarter, half + quarter);
            g.moveTo(half + quarter, half - quarter);
            g.lineTo(half - quarter, half + quarter);
        }
        this.cancelledSprite.visible = cancelled;
    }
}



type Method = (...args: any[]) => void | undefined;
function pixiUpdate(options: {noCache?: boolean} = {}) {
    return function <T extends Method>(target: any, key: string, descriptor: TypedPropertyDescriptor<T>) {
        const method = descriptor.value as unknown as Method;
        descriptor.value = <any>function(this: EntityPixi, ...args: any[]) {
            if (this.destroyed) {
                return;
            }
            const value = method.apply(this, args);
            if (!options.noCache) {
                this.container.cacheAsBitmap = false;
                this.container.cacheAsBitmap = true;
            }
            return value;
        };
    }
}

type ColorMatrixFilter = InstanceType<typeof pixi.filters["ColorMatrixFilter"]>;