import { Level, Cell, LevelGrid, LevelRow } from "./Level.js";
import * as pixi from "pixi.js";
import { Entity } from "./Entity.js";
import { App } from "./App.js";
import { AppEvents } from "./AppEvent.js";
import { Construct } from "./Construct.js";
import { Interaction } from "./Interaction.js";
import { Facing } from "../types/Facing.js";
import { Rule } from "./Rule.js";
import { MapOfSets } from "../util/MapOfSets.js";
import { Word } from "./Word.js";
import { ActionProcessor } from "./ActionProcessor.js";

export class LevelController {

    public actionProcessor: ActionProcessor | undefined;

    public _started: boolean = false;

    public ticker: pixi.Ticker;
    public container: pixi.Container;
    public resizeListener: EventListener;
    public gridGraphic: pixi.Graphics;

    public entitySet: Set<Entity> = new Set();
    public entityGrid: LevelGrid<Entity> = [];

    public rules: Rule[] = [];
    public tagToEntities: MapOfSets<Word, Entity> = new MapOfSets();
    public entityToTags: MapOfSets<Entity, Word> = new MapOfSets();


    public _interactionListener: (event: KeyboardEvent) => void;

    constructor(
        public level: Level
    ) {

        (globalThis as any)["controller"] = this;

        const app = App.get();
        const pixiApp = app.pixiApp;

        // remove all children and render empty screen
        for (const child of pixiApp.stage.children) {
            pixiApp.stage.removeChild(child)
        }
        pixiApp.render();

        //create new ticker
        this.ticker = new pixi.Ticker();

        //create container
        this.container = new pixi.Container();
        pixiApp.stage.addChild(this.container);

        //populate entities
        this._resetEntitiesToInit();

        this.rules = [...this.level.initData.defaultRules];
        this.generateEntityTagsFromRules();

        //setup grid graphics object
        this.gridGraphic = new pixi.Graphics();
        this.gridGraphic.zIndex = Infinity;
        this.container.addChild(this.gridGraphic);

        //setup resize listener
        this._fitContainerToScreen();
        this.resizeListener = () => this._fitContainerToScreen();
        globalThis.addEventListener(AppEvents.resize, this.resizeListener);

        //setup keyboard listener
        this._interactionListener = (event: KeyboardEvent) => this.keyboardInteraction(event);
        globalThis.addEventListener("keydown", this._interactionListener);

        //add the main `tick` function and start the ticker again
        this.ticker.add(() => this.tick());
        this.ticker.start();
    }


    public exit(): void {
        globalThis.removeEventListener(AppEvents.resize, this.resizeListener);
    }

    //#region GRAPHICAL


    public _fitContainerToScreen(): void {
        const app = App.get();
        const view = app.pixiApp.view;
        const level = this.level;

        this.container.pivot.set(level.pixelWidth/2, level.pixelHeight/2);
        this.container.transform.position.set(view.width/2, view.height/2);

        const xMult = view.width / level.pixelWidth;
        const yMult = view.height / level.pixelHeight;

        const scaleMultiplier = level.pixelHeight * xMult > view.height ? yMult : xMult;

        this.container.scale = {x: scaleMultiplier, y: scaleMultiplier};
    }


    public _drawGrid(): void {
        this.gridGraphic.clear();
        this.gridGraphic.lineStyle(2, 0x999999, 0.8);
        for (let x = 0; x <= this.level.width; x++) {
            this.gridGraphic.moveTo(x * this.level.TILE_SIZE, 0);
            this.gridGraphic.lineTo(x * this.level.TILE_SIZE, this.level.pixelHeight);
        }
        for (let y = 0; y <= this.level.height; y++) {
            this.gridGraphic.moveTo(0, y * this.level.TILE_SIZE);
            this.gridGraphic.lineTo(this.level.pixelWidth, y * this.level.TILE_SIZE);
        }
    }


    //#endregion GRAPHICAL


    //#region ENTITY


    public _resetEntitiesToInit(): void {
        this._removeAllEntities();

        this.entityGrid = [];
        for (let y = 0; y < this.level.height; y++) {
            const row: LevelRow<Entity> = [];
            this.entityGrid.push(row);
            for (let x = 0; x < this.level.width; x++) {
                const cell: Cell<Entity> = [];
                row.push(cell);
            }
        }

        const initConstructGrid = this.level.initData.startingEntities();
        for (let y = 0; y < initConstructGrid.length; y++) {
            const row = initConstructGrid[y];
            for (let x = 0; x < row.length; x++) {
                const constructs = row[x];
                for (const construct of constructs) {
                    const entity = new Entity({
                        level: this.level,
                        controller: this,
                        construct: construct,
                        x: x,
                        y: y,
                    });
                    this.entityGrid[y][x].push(entity);
                }
            }
        }
    }


    public _removeAllEntities(): void {
        type RemoveOptions = Parameters<Entity["removeFromLevel"]>[0];
        const removeOptions: RemoveOptions  = {noArrayMutations: true};
        for (const entity of this.entitySet) {
            entity.removeFromLevel(removeOptions);
        }
    }


    public getEntitiesAtPosition(x: number, y: number): Cell<Entity> {
        return this.entityGrid[y]?.[x] ?? [];
    }


    public getAllConstructsInLevel(): Construct[] {
        return [...new Set([...this.entitySet].map(e => e.construct))];
    }


    public getEntitiesOfConstruct(construct: Construct): Entity[] {
        return [...this.entitySet].filter(e => e.construct === construct);
    }


    public getAllConstructsWithEntitiesInLevel(): {construct: Construct; entities: Entity[]}[] {
        const map: Map<Construct, Entity[]> = new Map();
        for (const entity of this.entitySet) {
            let construct = entity.construct;
            let entityArray = map.get(construct);
            if (!entityArray) {
                entityArray = [];
                map.set(construct, entityArray);
            }
            entityArray.push(entity);
        }
        return [...map.entries()].map(entry => ({construct: entry[0], entities: entry[1]}));
    }


    //#endregion ENTITY


    public moveEntitiesOfConstruct(construct: Construct, facing: Facing, startX: number, startY: number, endX: number, endY: number) {
        console.log("Moving entities of", construct.associatedWord()._string, "in direction", facing, "to", endX, endY);
        const entitiesToMove = this.getEntitiesAtPosition(startX, startY)
            .filter(entity => entity.construct === construct);

        console.log("To move", entitiesToMove);

        this.entityGrid[startY][startX] = this.entityGrid[startY][startX]
            .filter(e => !entitiesToMove.includes(e));

        this.entityGrid[endY][endX].push(...entitiesToMove);
        for (const entity of entitiesToMove) {
            entity.facing = facing;
            entity.x = endX;
            entity.y = endY;
            entity.updateSpriteScreenPosition();
        }
    }


    public generateEntityTagsFromRules(): void {
        this.tagToEntities.clear();
        this.entityToTags.clear();
        for (const {rule} of this.rules) {
            const complementWord = rule.complement.word;
            const complementIsTag = rule.complement.word.behavior.tag;

            if (!complementIsTag) {
                continue;
            }

            const subjectWord = rule.subject.word;
            const noun = subjectWord.behavior.noun!;

            const selectedConstructs = this.getAllConstructsInLevel()
                .filter(construct => noun.selector(construct, this.level));

            const entities: Entity[] = selectedConstructs.reduce(
                (entities, construct) => {
                    entities.push(...this.getEntitiesOfConstruct(construct));
                    return entities;
                },
                [] as Entity[]
            );

            this.tagToEntities.addToSet(complementWord, ...entities);
            for (const entity of entities) {
                this.entityToTags.addToSet(entity, complementWord);
            }
        }
    }


    public keyboardInteraction(event: KeyboardEvent): void {

        const app = App.get();
        if (document.activeElement !== app.pixiApp.view) {
            return;
        }

        const key = event.key;
        let interactionType: Interaction["interaction"] | undefined;

        switch (key) {
            case "w":
            case "ArrowUp":
                interactionType = {type: "move", direction: Facing.up};
                break;
            case "a":
            case "ArrowLeft":
                interactionType = {type: "move", direction: Facing.left};
                break;
            case "d":
            case "ArrowRight":
                interactionType = {type: "move", direction: Facing.right};
                break;
            case "s":
            case "ArrowDown":
                interactionType = {type: "move", direction: Facing.down};
                break;
            case " ":
                interactionType = {type: "wait"};
                break;
        }

        if (!interactionType) {
            return;
        }

        event.preventDefault();
        this.actionProcessor!.processInteraction({interaction: interactionType})
    }





    start(): void {
        this.actionProcessor = new ActionProcessor(this);
        this._started = true;
    }


    tick(): void {
        if (!this._started) {
            this.start();
        }
        this._drawGrid();
    }
}