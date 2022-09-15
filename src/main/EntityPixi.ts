import * as pixi from "pixi.js";
import { AnimatedSprite } from "pixi.js";
import { App } from "../app/App.js";
import { debugFlags } from "../debug/debugFlags.js";
import { Direction } from "../types/Direction.js";
import { destroyAllChildren } from "../util/pixi/destroyAllChildren.js";
import { Constants } from "./Constants.js";
import { Entity } from "./Entity.js";
import { LevelController } from "./LevelController.js";

export class EntityPixi {

    static frameUpdateDelta = 1000 * 12/60;

    public entityId: number;
    public controller: LevelController;
    public destroyed: boolean = false;
    public cacheEnabled: boolean = false;

    public container: pixi.Container;
    public sprite: pixi.Sprite;
    public cancelledSprite: pixi.Graphics;
    public debugContainer: pixi.Container;
    public filterColor: ColorMatrixFilter;
    public textFilter: ColorMatrixFilter;
    public animationDelta: number = 0;

    public _visible: boolean = true;
    public _invisiblePosition = {x: 0, y: 0};

    public _debugContainers: {
        id?: pixi.Container
    } = {};

    constructor(public entity: Entity) {
        this.entityId = entity.id;
        this.controller = entity.controller;
        this.container = new pixi.Container();
        this.container.transform.pivot.set(this.controller.level.TILE_SIZE/2, this.controller.level.TILE_SIZE/2);

        if (entity.construct.spriteSheet) {
            this.sprite = new pixi.AnimatedSprite(entity.construct.spriteSheet.animations.jiggle, false);
        } else {
            this.sprite = new pixi.Sprite(entity.construct.texture);
        }

        {
            this.cancelledSprite = new pixi.Graphics();
            const half = this.controller.level.TILE_SIZE/2;
            const quarter = half/2;

            const g = this.cancelledSprite;
            g.lineStyle(5, 0xff0000);
            g.moveTo(half - quarter, half - quarter);
            g.lineTo(half + quarter, half + quarter);
            g.moveTo(half + quarter, half - quarter);
            g.lineTo(half - quarter, half + quarter);
            this.cancelledSprite.visible = false;
        }
        this.debugContainer = new pixi.Container();

        this.container.addChild(this.sprite, this.cancelledSprite, this.debugContainer);
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
            this.sprite.cacheAsBitmap = false;
            this.sprite.cacheAsBitmap = true;
        } else {
            this.sprite.cacheAsBitmap = false;
        }
    }


    public destroy(): void {
        if (this.destroyed) {
            return;
        }
        this.removeContainerFromController();
        destroyAllChildren(this.container);
    }


    @pixiUpdate({noCache: true})
    public play(deltaTime: number): void {
        if (this.sprite instanceof AnimatedSprite) {
            this.animationDelta += deltaTime;
            if (this.animationDelta > EntityPixi.frameUpdateDelta) {
                this.animationDelta = this.animationDelta % EntityPixi.frameUpdateDelta;
                let frame = this.sprite.currentFrame + 1;
                if (frame >= this.sprite.totalFrames) {
                    frame = 0;
                }
                this.sprite.gotoAndStop(frame);
                this.cache();
            }
        }
    }


    public addContainerToController(): void {
        if (this.destroyed) {
            return;
        }
        this.controller.containers.categories[this.entity.construct.category.name].addChild(this.container);
    }


    public removeContainerFromController(): void {
        if (this.destroyed) {
            return;
        }
        this.container.parent.removeChild(this.container);
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
    public setFacing(facing: Direction): void {
        if (this.entity.construct.facingTextures) {
            const texture = this.entity.construct.facingTextures[facing];
            this.sprite.texture = texture;
        }
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
            this.textFilter.brightness(0.6, false);
        }
    }


    @pixiUpdate({noCache: true})
    setWordCancelled(cancelled: boolean): void {
        this.cancelledSprite.visible = cancelled;
    }


    public _removeDebugContainer(key: keyof EntityPixi["_debugContainers"]): void {
        const debugContainer = this._debugContainers[key];
        if (!debugContainer) {
            return;
        }
        debugContainer.parent.removeChild(debugContainer);
        debugContainer.destroy();
        this._debugContainers[key] = undefined;
        this.cache();
    }


    @pixiUpdate({noCache: true})
    public _debugEntityId(): void {
        if (!debugFlags.drawEntityIds) {
            this._removeDebugContainer("id");
            return;
        }
        if (this._debugContainers.id) {
            return;
        }
        const graphics = new pixi.Graphics();
        this._debugContainers.id = graphics;
        this.debugContainer.addChild(graphics);
        const text = new pixi.Text(this.entity.id, new pixi.TextStyle({
            fontFamily : 'Arial',
            fontSize: 12,
            fill : 0xffffff,
            align : 'left'
        }));
        const bounds = text.getBounds();
        const bg = new pixi.Graphics();
        bg.beginFill(0x000000);
        bg.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        graphics.addChild(bg);
        graphics.addChild(text);
        this.cache();
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
                // this.container.cacheAsBitmap = false;
                // this.container.cacheAsBitmap = true;
                this.sprite.cacheAsBitmap = false;
                this.sprite.cacheAsBitmap = true;
            }
            return value;
        };
    }
}

type ColorMatrixFilter = InstanceType<typeof pixi.filters["ColorMatrixFilter"]>;