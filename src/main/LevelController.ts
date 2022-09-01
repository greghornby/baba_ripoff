import { Level, Cell, LevelGrid, LevelRow } from "./Level.js";
import * as pixi from "pixi.js";
import { Entity, EntityInitData } from "./Entity.js";
import { App } from "./App.js";
import { AppEvents } from "./AppEvent.js";
import { Construct } from "./Construct.js";
import { Interaction } from "./Interaction.js";
import { Facing } from "../types/Facing.js";
import { IRule, Rule, RuleNegatableWrapper } from "./Rule.js";
import { MapOfSets } from "../util/MapOfSets.js";
import { NounSelectionFunction, Word } from "./Word.js";
import { ActionProcessor } from "./ActionProcessor.js";
import { Sentence } from "./Sentence.js";
import { getPaths } from "../util/getPaths.js";
import { words } from "../objects/words.js";
import { debugPrint } from "../debug/debugPrint.js";
import { compareNegatableWord } from "../util/compareNegatableWord.js";
import { notRuleIsMoreSpecific } from "../util/notRuleIsMoreSpecific.js";
import { setAddMultiple } from "../util/setAddMultiple.js";
import { tempWinScreen } from "../util/tempWinScreen.js";

export class LevelController {

    levelWon: boolean = false;

    //#region Props
    public actionProcessor: ActionProcessor | undefined;
    public turnNumber: number = 0;

    public _started: boolean = false;

    public ticker: pixi.Ticker;
    public container: pixi.Container;
    public resizeListener: EventListener;
    public gridGraphic: pixi.Graphics | undefined;

    public entityCount: number = 0;
    /** id => Entity */
    public entityMap: Map<number, Entity> = new Map();
    public entityGrid: LevelGrid<Entity> = [];

    public defaultRules: Rule[] = [];
    public sentences: Sentence[] = [];
    public rules: Rule[] = [];
    /** Maps a cancelled out rule to the list of rules with NOT that cancel it out */
    public cancelledRules: Map<Rule, Rule[]> = new Map();
    public cancelledWordEntities: Set<Entity> = new Set();
    public tagToEntities: MapOfSets<Word, Entity> = new MapOfSets();
    public entityToTags: MapOfSets<Entity, Word> = new MapOfSets();
    public entityMutations: Map<Entity, Construct[]> = new Map();
    public activeTextEntities: Set<Entity> = new Set();

    public currentInteraction: Interaction | undefined;
    public _keyboardListener: (event: KeyboardEvent) => void;
    public _touchStartListener: (event: TouchEvent) => void;
    public _touchStopListener: (event: TouchEvent) => void;
    public _touchDoubleTap: boolean = false;
    public touches: Touch[] = [];

    public entitiesToAnimate: Set<Entity> = new Set();

    public tickFlags: {
        rebuildSentences?: boolean;
        _debugAlertedYouAreDead?: boolean;
    } = {};

    //#endregion Props

    constructor(
        public level: Level
    ) {

        (globalThis as any)["controller"] = this;

        const app = App.get();
        const pixiApp = app.pixiApp;

        // remove all children and render empty screen
        for (const child of pixiApp.stage.children) {
            pixiApp.stage.removeChild(child);
        }
        pixiApp.render();

        //create new ticker
        this.ticker = new pixi.Ticker();

        //create container
        this.container = new pixi.Container();
        this.container.sortableChildren = true;
        pixiApp.stage.addChild(this.container);

        this.defaultRules = [
            new Rule({
                subject: Rule.word(words.text),
                verb: {word: words.is},
                complement: Rule.word(words.push),
            })
        ];

        //populate entities
        this._resetEntitiesToInit();

        //setup grid graphics object
        this._drawGrid();

        //setup resize listener
        this._fitContainerToScreen();
        this.resizeListener = () => this._fitContainerToScreen();
        globalThis.addEventListener(AppEvents.resize, this.resizeListener);

        //setup keyboard listener
        this._keyboardListener = (event: KeyboardEvent) => this.keyboardInteraction(event);
        this._touchStartListener = (event: TouchEvent) => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                this.touches.push(event.changedTouches[i]);
            }
        }
        this._touchStopListener = (event: TouchEvent) => {
            this.touchInteraction(event);
            for (let i = 0; i < event.changedTouches.length; i++) {
                const currentTouch = event.changedTouches[i];
                this.touches = this.touches.filter(t => t.identifier !== currentTouch.identifier);
            }
        };
        globalThis.addEventListener("keydown", this._keyboardListener);
        globalThis.addEventListener("touchstart", this._touchStartListener);
        globalThis.addEventListener("touchend", this._touchStopListener);

        //add the main `tick` function and start the ticker again
        type TickFlags = typeof this.tickFlags;
        Object.assign<TickFlags, TickFlags>(this.tickFlags, {
            rebuildSentences: true,
            _debugAlertedYouAreDead: false
        });
        this.ticker.add(() => this.tick());
        this.ticker.start();
    }


    //#region GRAPHICAL


    public _getScale(): number {
        const app = App.get();
        const view = app.pixiApp.view;

        const xMult = view.width / this.level.pixelWidth;
        const yMult = view.height / this.level.pixelHeight;

        return this.level.pixelHeight * xMult > view.height ? yMult : xMult;
    }


    public _getCenter(type: "view" | "level" = "view"): [number, number] {
        const app = App.get();
        const view = app.pixiApp.view;
        return type === "view" ? [view.width/2, view.height/2] : [this.level.pixelWidth/2, this.level.pixelHeight/2];
    }


    public _fitContainerToScreen(): void {
        const center = this._getCenter();
        const level = this.level;
        this.container.pivot.set(level.pixelWidth/2, level.pixelHeight/2);
        this.container.transform.position.set(center[0], center[1]);

        const scaleMultiplier = this._getScale();

        this.container.scale = {x: scaleMultiplier, y: scaleMultiplier};
    }


    public _drawGrid(): void {
        this.gridGraphic = new pixi.Graphics();
        this.gridGraphic.zIndex = Number.MIN_SAFE_INTEGER;
        this.container.addChild(this.gridGraphic);
        this.gridGraphic.lineStyle(3, 0x999999, 1);
        for (let x = 0; x <= this.level.width; x++) {
            this.gridGraphic.moveTo(x * this.level.TILE_SIZE, 0);
            this.gridGraphic.lineTo(x * this.level.TILE_SIZE, this.level.pixelHeight);
        }
        for (let y = 0; y <= this.level.height; y++) {
            this.gridGraphic.moveTo(0, y * this.level.TILE_SIZE);
            this.gridGraphic.lineTo(this.level.pixelWidth, y * this.level.TILE_SIZE);
        }
        this.gridGraphic.cacheAsBitmap = true;
    }


    //#endregion GRAPHICAL


    //#region ENTITY


    public addEntity(entityData: EntityInitData, restoredId?: number) {
        const entity = new Entity(restoredId ?? this.entityCount++, entityData);
        const {x,y} = entityData;
        this.entityMap.set(entity.id, entity);
        this.entityGrid[y][x].push(entity);
        this.container.addChild(entity.pixiContainer);
    }


    public removeEntity(entity: Entity, options: {noArrayMutations?: boolean} = {}) {
        this.container.removeChild(entity.pixiContainer);
        if (!options.noArrayMutations) {
            this.entityMap.delete(entity.id);
            entity.pixiContainer.destroy();
        }
    }


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
                    this.addEntity({
                        level: this.level,
                        controller: this,
                        construct: construct,
                        x: x,
                        y: y,
                    });
                }
            }
        }
    }


    public _removeAllEntities(): void {
        type RemoveOptions = Parameters<LevelController["removeEntity"]>[1];
        const removeOptions: RemoveOptions  = {noArrayMutations: true};
        for (const [entityId, entity] of this.entityMap) {
            this.removeEntity(entity, removeOptions);
        }
    }


    public getGridCell(x: number, y: number): Readonly<Cell<Entity>> | undefined {
        return this.entityGrid[y]?.[x];
    }


    public getEntitiesAtPosition(x: number, y: number): Readonly<Cell<Entity>> {
        return this.getGridCell(x, y) ?? [];
    }


    public getAllConstructsInLevel(): Construct[] {
        const constructs: Construct[] = [];
        for (const entry of this.entityMap) {
            constructs.push(entry[1].construct);
        }
        return constructs;
    }


    public getEntitiesOfConstruct(construct: Construct): Entity[] {
        const entities: Entity[] = [];
        for (const entry of this.entityMap) {
            if (entry[1].construct === construct) {
                entities.push(entry[1]);
            }
        }
        return entities;
    }


    // public getAllConstructsWithEntitiesInLevel(): {construct: Construct; entities: Entity[]}[] {
    //     const map: Map<Construct, Entity[]> = new Map();
    //     for (const [entityId, entity] of this.entityMap) {
    //         let construct = entity.construct;
    //         let entityArray = map.get(construct);
    //         if (!entityArray) {
    //             entityArray = [];
    //             map.set(construct, entityArray);
    //         }
    //         entityArray.push(entity);
    //     }
    //     return [...map.entries()].map(entry => ({construct: entry[0], entities: entry[1]}));
    // }


    public moveEntity(entity: Entity, facing: Facing, startX: number, startY: number, endX: number, endY: number): void {
        this.entityGrid[startY][startX] = this.entityGrid[startY][startX]
            .filter(e => e !== entity);
        this.entityGrid[endY][endX].push(entity);

        entity.setFacing(facing);
        entity.x = endX;
        entity.y = endY;
        entity.animation().addMotionSlide({startX, startY, endX, endY, frames: 5});

        if (entity.construct instanceof Word) {
            this.tickFlags.rebuildSentences = true;
        }
    }


    public swapOutEntity(entityId: number): void {
        const entity = this.entityMap.get(entityId)!;
        //@todo add animation
        this.removeEntity(entity);
    }


    public swapInEntity(entityId: number, construct: Construct, x: number, y: number): void {
        const entity = this.addEntity({
            level: this.level,
            controller: this,
            construct: construct,
            x: x,
            y: y
        }, entityId);
        //@todo add animation
    }


    //#endregion ENTITY
    //#region RULES


    public findSentences(): void {
        const directions = ["horizontal", "vertical"] as const;
        type SentenceDirection = typeof directions[number];
        const cellsChecked = new Map<string, Record<SentenceDirection, boolean>>();

        const sentences: Sentence[] = [];

        for (let y = 0; y < this.entityGrid.length; y++) {
            const row = this.entityGrid[y];
            for (let x = 0; x < row.length; x++) {
                const cellHasWords = row[x].filter(e => e.construct instanceof Word).length > 0;
                if (!cellHasWords) {
                    continue;
                }
                for (const direction of directions) {
                    let cells: Entity[][] = [];
                    const failSafeIterations = 1e3;
                    let alreadyChecked = false;
                    for (let i = 0; i < failSafeIterations; i++) {
                        const nextX = x + (direction === "vertical" ? 0 : i);
                        const nextY = y + (direction === "horizontal" ? 0 : i);
                        const cell: Cell<Entity> | undefined = this.entityGrid[nextY]?.[nextX];
                        if (!cell) {
                            break;
                        }
                        const cellName = `${nextX}:${nextY}`;
                        let cellCheck = cellsChecked.get(cellName);
                        if (!cellCheck) {
                            cellCheck = {horizontal: false, vertical: false};
                            cellsChecked.set(cellName, cellCheck);
                        }
                        if (cellCheck[direction]) {
                            alreadyChecked = true;
                            break;
                        }
                        cellCheck[direction] = true;
                        const words = cell.filter(e => e.construct instanceof Word);
                        if (words.length === 0) {
                            break;
                        }
                        cells.push(words);
                    }

                    if (alreadyChecked) {
                        continue;
                    }

                    const arrayOfSentences = getPaths(cells);
                    for (const words of arrayOfSentences) {
                        const sentence = new Sentence(words.map(word => word.construct as Word), words);
                        if (sentence.isPotentiallyASentence()) {
                            sentences.push(sentence);
                        }
                    }
                }
            }
        }

        this.sentences = sentences;
        debugPrint.sentences(this.sentences);
    }


    public updateLevelRules(): void {
        const rulesSet: Set<Rule> = new Set();
        setAddMultiple(rulesSet, ...this.defaultRules);
        // this.rules = [...this.level.initData.defaultRules];
        for (const sentence of this.sentences) {
            const sentenceRules = sentence.getRules();
            setAddMultiple(rulesSet, ...sentenceRules);
            // this.rules.push(...sentenceRules);
        }

        for (const entity of this.cancelledWordEntities) {
            entity.setCancelledWord(false);
        }
        this.cancelledRules.clear();
        this.cancelledWordEntities.clear();

        const complementRules: Rule[] = [];
        const notComplementRules: Rule[] = [];
        for (const rule of rulesSet) {
            (rule.rule.complement.not ? notComplementRules : complementRules).push(rule);
        }

        for (const rule of complementRules) {
            for (const notRule of notComplementRules) {
                // skip if they don't have the same subject or complement
                // as a not rule can only cancel out a rule
                // of the same subject
                const {match: sameSubject} = compareNegatableWord(rule.rule.subject, notRule.rule.subject);
                const {match: sameComplement} = compareNegatableWord(rule.rule.complement, notRule.rule.complement, true); //ignore not with true boolean
                if (!sameSubject || !sameComplement) {
                    continue;
                }
                const notIsMoreSpecific = notRuleIsMoreSpecific(rule, notRule);
                if (notIsMoreSpecific) {
                    continue;
                }
                const cancelledBy = this.cancelledRules.get(rule) ?? [];
                cancelledBy.push(notRule);
                this.cancelledRules.set(rule, cancelledBy);

                //only cancel words of simple rules for now
                //@todo figure out a way to display cancelled complex sentences
                if (!rule.rule.preCondition && !rule.rule.postCondition) {
                    this.cancelledWordEntities.add(rule.rule.subject.entity!);
                    this.cancelledWordEntities.add(rule.rule.verb.entity!);
                    this.cancelledWordEntities.add(rule.rule.complement.entity!);
                }
            }
        }

        for (const [rule] of this.cancelledRules) {
            rulesSet.delete(rule);
        }
        this.rules = [...rulesSet];

        for (const entity of this.cancelledWordEntities) {
            entity.setCancelledWord(true);
        }
    }


    public updateActiveTextEntities(): void {
        for (const entity of this.activeTextEntities) {
            entity.setActiveTextSprite(false);
        }
        this.activeTextEntities.clear();
        for (const sentence of this.sentences) {
            for (const entity of sentence.activeTextEntities) {
                this.activeTextEntities.add(entity);
                entity.setActiveTextSprite(true);
            }
        }
    }


    public generateEntityTagsAndMutationsFromRules(): void {
        this.tagToEntities.clear();
        this.entityToTags.clear();
        this.entityMutations.clear();
        for (const {rule} of this.rules) {
            const complementNot = rule.complement.not;
            const complementWord = rule.complement.word;
            const complementIsTag = rule.complement.word.behavior.tag;
            const complementIsMutation = rule.complement.word.behavior.noun;

            if (!complementIsTag && !complementIsMutation) {
                continue;
            }

            const levelConstructs = this.getAllConstructsInLevel();

            const subjectNot = rule.subject.not;
            const subjectWord = rule.subject.word;
            const subjectNoun = subjectWord.behavior.noun!;

            const subjectSelector = subjectNoun.type === "single" ? subjectNoun.selector : subjectNoun.subject;

            const selectorFn = (construct: Construct): boolean => {
                let result: boolean;
                if (subjectSelector instanceof Construct) {
                    result = construct === subjectSelector;
                } else {
                    result = (subjectSelector as NounSelectionFunction)(construct, subjectWord, this.level);
                }
                if (subjectNot) {
                    result = !result;
                }
                return result;
            };

            const selectedConstructs = levelConstructs.filter(selectorFn);

            const entities: Entity[] = selectedConstructs.reduce(
                (entities, construct) => {
                    entities.push(...this.getEntitiesOfConstruct(construct));
                    return entities;
                },
                [] as Entity[]
            );

            if (complementIsTag) {
                if (complementNot) {
                    this.tagToEntities.removeFromSet(complementWord, ...entities);
                } else {
                    this.tagToEntities.addToSet(complementWord, ...entities);
                }
                for (const entity of entities) {
                    if (complementNot) {
                        this.entityToTags.removeFromSet(entity, complementWord);
                    } else {
                        this.entityToTags.addToSet(entity, complementWord);
                    }
                }
            } else if (complementIsMutation && !complementNot) {
                for (const entity of entities) {
                    const complementNoun = complementWord.behavior.noun!;
                    const complementSelector = complementNoun.type === "single" ? complementNoun.selector : complementNoun.complement;
                    const mutateToConstructs =
                        complementSelector instanceof Construct
                        ? [complementSelector]
                        : levelConstructs.filter(construct => (complementSelector as NounSelectionFunction)(construct, complementWord, this.level));
                    const entityToConstructs = this.entityMutations.get(entity) ?? [];
                    entityToConstructs.push(...mutateToConstructs);
                    this.entityMutations.set(entity, entityToConstructs);
                }
            }
        }
    }


    //#endregion RULES
    //#region INTERACTION


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
            case "z":
                interactionType = {type: "undo"};
                break;
        }

        if (!interactionType) {
            return;
        }

        event.preventDefault();
        this.currentInteraction = {interaction: interactionType};
    }


    public touchInteraction(event: TouchEvent): void {

        let interactionType: Interaction["interaction"];
        event.preventDefault();

        if (!this._touchDoubleTap) {
            this._touchDoubleTap = true;
            setTimeout(() => {
                this._touchDoubleTap = false;
            }, 300);
        } else {
            interactionType = {type: "undo"};
            this.currentInteraction = {interaction: interactionType};
            return;
        }

        const endTouch = event.changedTouches[0];
        const startTouch = this.touches.find(t => t.identifier === endTouch.identifier)!;

        const diffX = endTouch.pageX - startTouch.pageX;
        const diffY = endTouch.pageY - startTouch.pageY;

        const requiredDistance = this.level.TILE_SIZE * this.container.scale.x;
        if (Math.abs(diffX) < requiredDistance && Math.abs(diffY) < requiredDistance) {
            return;
        }

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                interactionType = {type: "move", direction: Facing.right};
            } else {
                interactionType = {type: "move", direction: Facing.left};
            }
        } else {
            if (diffY > 0) {
                interactionType = {type: "move", direction: Facing.down};
            } else {
                interactionType = {type: "move", direction: Facing.up};
            }
        }

        this.currentInteraction = {interaction: interactionType};
    }


    //#endregion INTERACTION


    start(): void {
        this.actionProcessor = new ActionProcessor(this);
        this._started = true;
        //set a default interaction to init the level in first tick
        this.currentInteraction = {interaction: {type: "wait"}};
    }


    public exit(): void {
        const app = App.get();
        globalThis.removeEventListener(AppEvents.resize, this.resizeListener);
    }


    tick(): void {
        if (!this._started) {
            this.start();
        }

        //debug entities
        // for (const entity of this.entityMap.values()) {
        //     entity._debugFacingGraphic();
        //     entity._debugEntityId();
        // }

        const isAnimating = this.entitiesToAnimate.size > 0;
        for (const entity of this.entitiesToAnimate) {
            entity.renderNextAnimationFrame();
        }
        if (isAnimating) {
            return;
        }
        if (this.levelWon) {
            return;
        }

        if (!this.currentInteraction) {
            return;
        }

        const regenRules = () => {
            if (!this.tickFlags.rebuildSentences) {
                return false;
            }
            this.tickFlags.rebuildSentences = false;
            this.findSentences();
            this.updateLevelRules();
            this.updateActiveTextEntities();
            this.generateEntityTagsAndMutationsFromRules();
            return true;
        };

        // Process the interaction and unset it
        const interaction = this.currentInteraction;
        this.currentInteraction = undefined;
        this.actionProcessor!.doInteraction(interaction);
        if (interaction.interaction.type === "undo") {
            regenRules();
            return;
        }

        const flags = this.tickFlags;

        let iterations: number = 0;
        let tagsAndMutationsAlreadyGenerated: boolean = false;
        while (regenRules()) {
            if (iterations++ >= 20) {
                console.log("Too many loops");
                break;
            }
            tagsAndMutationsAlreadyGenerated = true;

            this.actionProcessor!.doMutations();

            //check YOU
            const youEntities = this.tagToEntities.get(wordYou);
            if (!youEntities || youEntities.size === 0) {
                if (!flags._debugAlertedYouAreDead) {
                    console.log("YOU ARE DEAD");
                    alert("YOU DO NOT EXIST!");
                    flags._debugAlertedYouAreDead = true;
                }
            } else {
                flags._debugAlertedYouAreDead = false;
            }
        }

        const winEntities = this.tagToEntities.get(wordWin);
        if (winEntities) {
            console.log("Found win entities");
            for (const entity of winEntities) {
                const getEntities = this.getEntitiesAtPosition(entity.x, entity.y);
                const youEntity = getEntities.find(e => this.entityToTags.get(e)?.has(wordYou));
                if (youEntity) {
                    // console.log("YOU'RE WINNER");
                    // alert("YOU'RE WINNER");
                    this.levelWon = true;
                    tempWinScreen(this);
                }
            }
        }

        if (!tagsAndMutationsAlreadyGenerated) {
            this.generateEntityTagsAndMutationsFromRules();
        }

        this.turnNumber++;
    }
}

const wordYou = Word.findWordFromText("you");
const wordWin = Word.findWordFromText("win");