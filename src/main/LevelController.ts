import * as pixi from "pixi.js";
import { App } from "../app/App.js";
import { AppEventInterface } from "../app/AppEventInterface.js";
import { debugPrint } from "../debug/debugPrint.js";
import { categories } from "../objects/categories.js";
import { textures } from "../objects/textures.js";
import { words } from "../objects/words.js";
import { Direction } from "../types/Direction.js";
import { getInteractionFromKeyboard } from "../util/controller/getInteractionFromKeyboard.js";
import { getInteractionFromSwipe } from "../util/controller/getInteractionFromSwipe.js";
import { setEntityTagsAndVerbsFromRule } from "../util/controller/setEntityTagsAndVerbsFromRule.js";
import { visuallyCancelSentences } from "../util/controller/visuallyCancelSentences.js";
import { arrayRemove } from "../util/data/arrayRemove.js";
import { EmptyArray } from "../util/data/EmptyArray.js";
import { EmptySet } from "../util/data/EmptySet.js";
import { generatePairsFromArray } from "../util/data/generatePairsFromArray.js";
import { getPaths } from "../util/data/getPaths.js";
import { MapOfSets } from "../util/data/MapOfSets.js";
import { setAddMultiple } from "../util/data/setAddMultiple.js";
import { destroyContainerAndAllChildren } from "../util/pixi/destroyContainerAndAllChildren.js";
import { destroyOnlyChildren } from "../util/pixi/destroyOnlyChildren.js";
import { isNotComplement } from "../util/rules/isNotComplement.js";
import { rulesCancel } from "../util/rules/rulesCancel.js";
import { VerbUnion } from "../util/rules/verbEquals.js";
import { tempWinScreen } from "../util/temp/tempWinScreen.js";
import { ActionProcessor } from "./ActionProcessor.js";
import { AnimationSystem } from "./AnimationSystem.js";
import { Category } from "./Category.js";
import { Construct } from "./Construct.js";
import { winParticlesAnimation } from "./coroutines/winParticlesAnimation.js";
import { Entity, EntityInitData } from "./Entity.js";
import { Interaction } from "./Interaction.js";
import { Cell, Level, LevelGrid, LevelRow } from "./Level.js";
import { MenuController } from "./MenuController.js";
import { Rule } from "./Rule.js";
import { Sentence } from "./Sentence.js";
import { Word } from "./Word.js";

export class LevelController {

    static instance: LevelController | undefined;

    public static _keyboardListener: {};
    public static _swipeListener: {};
    public static _singleTapListener: {};
    public static _longTapListener: {};
    public static _doubleTapListener: {};
    public static _resizeListener: {};

    public static staticInitted = false;
    public static initStatic() {
        LevelController.staticInitted = true;
        const app = App.get();
        this._keyboardListener = app.events.addListener("keyboard", event => this.instance && event.type === "down" ? this.instance.keyboardInteraction(event) : undefined);
        this._swipeListener = app.events.addListener("swipe", event => this.instance ? this.instance.swipeInteraction(event) : undefined);
        this._singleTapListener = app.events.addListener("singleTap", event => this.instance ? this.instance.singleTapInteraction(event) : undefined);
        this._longTapListener = app.events.addListener("longTap", event => this.instance ? this.instance.longTapInteraction(event) : undefined);
        this._doubleTapListener = app.events.addListener("doubleTap", event => this.instance ? this.instance.doubleTapInteraction(event) : undefined);
        this._resizeListener = app.events.addListener("resize", () => this.instance ? this.instance._fitContainerToScreen() : undefined);
    }

    static load(level: Level) {
        new LevelController(level);
    }

    paused: boolean = false;

    timeLastTick: number | undefined;
    timeStarted: number = performance.now();
    timeElapsed: number = 0;
    ticksElapsed: number = 0;

    levelWon: boolean = false;

    //#region Props
    public actionProcessor: ActionProcessor;
    public animationSytem: AnimationSystem;
    public turnNumber: number = 0;

    public ticker: pixi.Ticker;
    public container: pixi.Container;
    public containers: {
        grid: pixi.Graphics;
        background: pixi.Container;
        categories: Record<string, pixi.Container>;
        particles: pixi.Container;
        splash: pixi.Container,
        pause: pixi.Container,
    };

    public entityCount: number = 0;
    /** Stores all Entities current present in the level */
    public entities: Set<Entity> = new Set();
    /**
     * A map of an Entity id to the Entity object.
     * This map may contain Entities no longer present in the level
     * For that I have used the Omit type to make this map not iterable in Typescript
     */
    public entityMap: Omit<Map<number, Entity>, typeof Symbol.iterator> = new Map();
    /** A set of entities to remove from entityMap when no longer needed by anything  */
    public entityMapMarkedForCleanup: Set<number> = new Set();
    public entityGrid: LevelGrid<Entity> = [];

    public defaultRules: Rule[] = [];
    public sentences: Sentence[] = [];
    public rules: Set<Rule> = new Set();
    /** Maps a cancelled out rule to the list of rules with NOT that cancel it out */
    public _cancelledRules: Set<Rule> = new Set();
    public _cancelledWordEntities: Set<Entity> = new Set();
    public tagToEntities: MapOfSets<Word, Entity> = new MapOfSets();
    public entityToTags: MapOfSets<Entity, Word> = new MapOfSets();
    public entityVerbs: Record<`${VerbUnion}${""|"Not"}`, Map<Entity, Set<Construct>>> = {
        is: new Map(),
        isNot: new Map(),
        has: new Map(),
        hasNot: new Map(),
        make: new Map(),
        makeNot: new Map()
    };
    public mutationMap: Map<Entity, {
        sentence: Sentence;
        subjectWord: Word;
        constructs: {
            construct: Construct;
            complementWord: Word;
        }[];
    }[]> = new Map();
    public entityStrictlySelfMutations: Set<Entity> = new Set();
    public activeTextEntities: Set<Entity> = new Set();

    public currentInteraction: Interaction | undefined;

    public tickFlags: {
        rebuildSentences?: boolean;
        _debugAlertedYouAreDead?: boolean;
    } = {};

    public coroutines: Set<Iterator<any, any, any>> = new Set();

    //#endregion Props

    constructor(
        public level: Level
    ) {

        LevelController.instance = this;

        if (!LevelController.staticInitted) {
            LevelController.initStatic();
        }

        (globalThis as any)["controller"] = this;

        const app = App.get();
        const pixiApp = app.pixiApp;

        // remove all children and render empty screen
        destroyOnlyChildren(pixiApp.stage);
        pixiApp.render();

        //create new ticker
        this.ticker = new pixi.Ticker();

        //create container
        this.container = new pixi.Container();
        this.containers = {
            grid: new pixi.Graphics(),
            background: new pixi.Container(),
            particles: new pixi.Container(),
            categories: Object.fromEntries(
                Object.values(categories).map<[string, pixi.Container]>(c => [c.name, new pixi.Container])
            ),
            splash: new pixi.Container(),
            pause: new pixi.Container()
        };
        const containerOrder: pixi.DisplayObject[] = [
            this.containers.grid,
            this.containers.background,
            ...Object.entries(this.containers.categories)
                .sort(([categoryNameA], [categoryNameB]) => Category.store[categoryNameA].priority - Category.store[categoryNameB].priority)
                .map(([,container]) => container),
            this.containers.particles,
            this.containers.splash,
            this.containers.pause
        ];
        this.container.addChild(...containerOrder);
        pixiApp.stage.addChild(this.container);

        if (this.level.initData.background) {
            for (const bg of this.level.initData.background) {
                const sprite = pixi.Sprite.from(bg.texture);
                sprite.x = bg.x * this.level.TILE_SIZE;
                sprite.y = bg.y * this.level.TILE_SIZE;
                this.containers.background.addChild(sprite);
            }
        }

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
        this._createPauseScreen();

        //setup resize listener
        this._fitContainerToScreen();


        //add the main `tick` function and start the ticker again
        type TickFlags = typeof this.tickFlags;
        Object.assign<TickFlags, TickFlags>(this.tickFlags, {
            rebuildSentences: true,
            _debugAlertedYouAreDead: true
        });

        this.actionProcessor = new ActionProcessor(this);
        this.animationSytem = new AnimationSystem(this);

        this.parseRules();

        this.coroutines.add(winParticlesAnimation(this));

        this.ticker.add(() => this.tick());
        this.ticker.start();
        // this.ticker.maxFPS = 30;
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
        const gridGraphic = this.containers.grid;
        gridGraphic.lineStyle(3, 0x999999, 0.35);
        for (let x = 0; x <= this.level.width; x++) {
            gridGraphic.moveTo(x * this.level.TILE_SIZE, 0);
            gridGraphic.lineTo(x * this.level.TILE_SIZE, this.level.pixelHeight);
        }
        for (let y = 0; y <= this.level.height; y++) {
            gridGraphic.moveTo(0, y * this.level.TILE_SIZE);
            gridGraphic.lineTo(this.level.pixelWidth, y * this.level.TILE_SIZE);
        }
        gridGraphic.cacheAsBitmap = true;
    }


    public _createPauseScreen(): void {
        const pauseContainer = this.containers.pause;
        const transparentOverlay = new pixi.Graphics();
        transparentOverlay.beginFill(0x006e8f, 0.5);
        transparentOverlay.drawRect(0, 0, this.level.pixelWidth, this.level.pixelHeight);
        const menuSprite = new pixi.Sprite(textures.menus.pause_menu);
        menuSprite.anchor.set(0.5, 0.5);
        menuSprite.transform.position.set(this.level.pixelWidth / 2, this.level.pixelHeight / 2);

        const resumeInteractive = new pixi.Sprite();
        resumeInteractive.hitArea = new pixi.Rectangle(50 - 200, 25 - 125, 300, 50);
        resumeInteractive.hitArea
        resumeInteractive.buttonMode = true;
        resumeInteractive.interactive = true;
        resumeInteractive.on("pointertap", () => this.togglePause(false));

        const restartInteractive = new pixi.Sprite();
        restartInteractive.hitArea = new pixi.Rectangle(50 - 200, 100 - 125, 300, 50);
        restartInteractive.hitArea
        restartInteractive.buttonMode = true;
        restartInteractive.interactive = true;
        restartInteractive.on("pointertap", () => this.restart());

        const menuInteractive = new pixi.Sprite();
        menuInteractive.hitArea = new pixi.Rectangle(50 - 200, 175 - 125, 300, 50);
        menuInteractive.hitArea
        menuInteractive.buttonMode = true;
        menuInteractive.interactive = true;
        menuInteractive.on("pointertap", () => {
            this.exit();
            MenuController.load();
        });

        pauseContainer.addChild(transparentOverlay, menuSprite);
        menuSprite.addChild(resumeInteractive, restartInteractive, menuInteractive);

        pauseContainer.visible = false;
    }


    //#endregion GRAPHICAL


    //#region ENTITY


    public addEntity(
        entityData: Omit<EntityInitData, "level" | "controller">,
        options?: {restoredId?: number, visibleOnInit?: boolean}
    ): Entity {
        const entity = new Entity(options?.restoredId ?? this.entityCount++, {
            ...entityData,
            level: this.level,
            controller: this
        });
        const {x,y} = entityData;
        this.entities.add(entity);
        this.entityMap.set(entity.id, entity);
        this.entityMapMarkedForCleanup.delete(entity.id);
        this.entityGrid[y][x].push(entity);
        entity.entityPixi.addContainerToController();
        if (options?.visibleOnInit === false) {
            entity.entityPixi.setVisible(false);
        }

        if (entityData.construct instanceof Word) {
            this.tickFlags.rebuildSentences = true;
        }
        return entity;
    }


    public removeEntity(entity: Entity, options: {noArrayMutations?: boolean; instant?: boolean} = {}) {
        if (!options.noArrayMutations) {
            this.entities.delete(entity);
            this.entityMapMarkedForCleanup.add(entity.id);
            this.removeEntityFromCell(entity);
            if (options.instant !== false) {
                entity.entityPixi.destroy();
            }
        }

        if (entity.construct instanceof Word) {
            this.tickFlags.rebuildSentences = true;
        }
    }


    public breakEntity(
        entity: Entity,
    ) {
        this.removeEntity(entity, {instant: false});

        //implement has logic etc
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
        for (let y = 0; y < initConstructGrid.grid.length; y++) {
            const row = initConstructGrid.grid[y];
            for (let x = 0; x < row.length; x++) {
                const constructs = row[x];
                for (const construct of constructs) {
                    const entity = this.addEntity({
                        construct: construct,
                        x: x,
                        y: y,
                    });
                    const setter = initConstructGrid.entitySetters.find(s => s.x === x && s.y === y);
                    setter?.fn(entity);
                }
            }
        }
    }


    public _removeAllEntities(): void {
        type RemoveOptions = Parameters<LevelController["removeEntity"]>[1];
        const removeOptions: RemoveOptions  = {noArrayMutations: true, instant: true};
        for (const entity of this.entities) {
            this.removeEntity(entity, removeOptions);
        }
    }


    public removeEntityFromCell(entity: Entity): void;
    public removeEntityFromCell(entity: Entity, x: number, y: number): void;
    public removeEntityFromCell(entity: Entity, x?: number, y?: number): void {
        // this.entityGrid[y ?? entity.y][x ?? entity.x] =
        //     this.entityGrid[y ?? entity.y][x ?? entity.x]
        //     .filter(e => e !== entity);
        arrayRemove(
            this.entityGrid[y ?? entity.y][x ?? entity.x],
            entity
        );
    }


    public addEntityToCell(entity: Entity): void;
    public addEntityToCell(entity: Entity, x: number, y: number): void;
    public addEntityToCell(entity: Entity, x?: number, y?: number): void {
        this.entityGrid[y ?? entity.y][x ?? entity.x].push(entity);
    }


    public getGridCell(x: number, y: number): Readonly<Cell<Entity>> | undefined {
        return this.entityGrid[y]?.[x];
    }


    public getEntitiesAtPosition(x: number, y: number): Readonly<Cell<Entity>> {
        return this.getGridCell(x, y) ?? EmptyArray;
    }


    public getAllConstructsInLevel(): Construct[] {
        const constructs: Construct[] = [];
        for (const entity of this.entities) {
            if (constructs.includes(entity.construct)) {
                continue;
            }
            constructs.push(entity.construct);
        }
        return constructs;
    }


    public getEntitiesOfConstruct(construct: Construct): Entity[] {
        const entities: Entity[] = [];
        for (const entity of this.entities) {
            if (entity.construct === construct) {
                entities.push(entity);
            }
        }
        return entities;
    }


    public moveEntity(entity: Entity, startX: number, startY: number, endX: number, endY: number): void {
        this.removeEntityFromCell(entity);
        entity.x = endX;
        entity.y = endY;
        this.addEntityToCell(entity, endX, endY);

        if (entity.construct instanceof Word) {
            this.tickFlags.rebuildSentences = true;
        }
    }


    public faceEntity(entity: Entity, facing: Direction): void {
        entity.setFacing(facing);
    }


    public swapOutEntity(entityId: number): void {
        const entity = this.entityMap.get(entityId)!;
        this.removeEntity(entity, {instant: false});
    }


    public swapInEntity(entityId: number, construct: Construct, x: number, y: number): void {
        const entity = this.addEntity({
            construct: construct,
            x: x,
            y: y
        }, {restoredId: entityId, visibleOnInit: false});
    }


    public getEntitiesByTag(tag: string | Word): ReadonlySet<Entity> {
        const word = typeof tag === "string" ? Word.findWordFromText(tag) : tag;
        const s = this.tagToEntities.get(word);
        if (s) {
            return s;
        } else {
            return EmptySet;
        }
    }


    public getEntityTags(entity: Entity): ReadonlySet<Word> {
        return this.entityToTags.get(entity) ?? EmptySet;
    }


    //#endregion ENTITY
    //#region RULES


    public _findSentences(): void {
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


    public _updateLevelRules(): void {
        this.rules.clear();
        setAddMultiple(this.rules, ...this.defaultRules);

        const sentenceToRules = new Map<Sentence, Rule[]>();
        for (const sentence of this.sentences) {
            const sentenceRules = sentence.getRules();
            setAddMultiple(this.rules, ...sentenceRules);

            const x = sentenceToRules.get(sentence) ?? [];
            sentenceToRules.set(sentence, x);
            x.push(...sentenceRules);
        }

        this._cancelledRules.clear();

        for (const [ruleA, ruleB] of generatePairsFromArray([...this.rules])) {
            const cancelledRule = rulesCancel(ruleA, ruleB);
            if (cancelledRule) {
                this._cancelledRules.add(cancelledRule);
            }
        }

        visuallyCancelSentences(this, sentenceToRules);

        for (const rule of this._cancelledRules) {
            this.rules.delete(rule);
        }
    }


    public parseRules(skipIfThisArgFalse: boolean = true): void {
        if (skipIfThisArgFalse === false) {
            return;
        }
        this._findSentences();
        this._updateLevelRules();
        this.updateActiveTextEntities();
        this.generateEntityTagsAndMutationsFromRules();
    }


    public setCancelledSentences(sentences: Sentence[]) {

    }


    public updateActiveTextEntities(): void {
        for (const entity of this.activeTextEntities) {
            entity.setActiveText(false);
        }
        this.activeTextEntities.clear();
        for (const sentence of this.sentences) {
            for (const entity of sentence.activeTextEntities) {
                this.activeTextEntities.add(entity);
                entity.setActiveText(true);
            }
        }
    }


    public generateEntityTagsAndMutationsFromRules(): void {
        this.tagToEntities.clear();
        this.entityToTags.clear();
        for (const map of Object.values(this.entityVerbs)) {
            map.clear();
        }
        this.entityStrictlySelfMutations.clear();

        const _2ndPassRules: Rule[] = [];
        for (const rule of this.rules) {
            if (!isNotComplement(rule)) {
                _2ndPassRules.push(rule);
                continue;
            }
            setEntityTagsAndVerbsFromRule(this, rule);
        }
        for (const rule of _2ndPassRules) {
            setEntityTagsAndVerbsFromRule(this, rule);
        }
    }


    public checkYouAreDead(): boolean {
        const flags = this.tickFlags;
        const youEntities = this.tagToEntities.get(wordYou);
        if (!youEntities || youEntities.size === 0) {
            if (!flags._debugAlertedYouAreDead) {
                alert("You are dead. Undo or Restart");
                flags._debugAlertedYouAreDead = true;
            }
            return true;
        } else {
            flags._debugAlertedYouAreDead = false;
            return false;
        }
    }


    public checkYouWin(): void {
        const winEntities = this.tagToEntities.get(wordWin);
        if (!winEntities) {
            return;
        }
        for (const entity of winEntities) {
            const getEntities = this.getEntitiesAtPosition(entity.x, entity.y);
            const youEntity = getEntities.find(e => this.entityToTags.get(e)?.has(wordYou));
            if (youEntity) {
                this.levelWon = true;
                tempWinScreen(this);
            }
        }
    }


    //#endregion RULES

    //#region INTERACTION
    public keyboardInteraction(event: AppEventInterface.Keyboard): boolean | void {
        const interaction = getInteractionFromKeyboard(event);
        if (interaction) {
            if (!this.currentInteraction) {
                this.currentInteraction = interaction;
            }
            return true;
        }
    }

    public swipeInteraction(event: AppEventInterface.Swipe): boolean {
        if (!this.currentInteraction) {
            this.currentInteraction = getInteractionFromSwipe(this, event);
        }
        return true;
    }

    public singleTapInteraction(event: AppEventInterface.SingleTap): boolean | void {
        const interaction: Interaction = {interaction: {type: "wait"}};
        if (!this.currentInteraction) {
            this.currentInteraction = interaction;
        }
        return true;
    }

    public longTapInteraction(event: AppEventInterface.LongTap): boolean | void {
        const interaction: Interaction = {interaction: {type: "pause"}};
        if (!this.currentInteraction) {
            this.currentInteraction = interaction;
        }
        return true;
    }

    public doubleTapInteraction(event: AppEventInterface.DoubleTap): boolean | void {
        const interaction: Interaction = {interaction: {type: "undo"}};
        if (!this.currentInteraction) {
            this.currentInteraction = interaction;
        }
        return true;
    }
    //#endregion INTERACTION


    public exit(): void {
        this.ticker.destroy();
        destroyContainerAndAllChildren(this.container);
        LevelController.instance = undefined;
    }


    public restart(): void {
        this.exit();
        new LevelController(this.level);
    }


    public togglePause(pause?: boolean): void {
        if (pause === undefined) {
            this.paused = !this.paused;
        } else {
            this.paused = pause;
        }
    }


    tick(): void {

        if (this.currentInteraction?.interaction.type === "pause") {
            this.togglePause();
        }

        if (this.paused) {
            if (!this.containers.pause.visible) {
                this.containers.pause.visible = true;
            }
        } else {
            if (this.containers.pause.visible) {
                this.containers.pause.visible = false;
            }
        }

        this.ticksElapsed++;
        const now = performance.now();
        this.timeElapsed = now - this.timeStarted;
        const deltaTime = this.timeLastTick ? now - this.timeLastTick : 0;
        this.timeLastTick = now;
        // console.log("Delta Time", deltaTime);
        // if (deltaTime >= 20) {
        //     console.log("Delta time high", deltaTime);
        // }

        // do entity loop
        for (const entity of this.entityMap.values()) {
            entity.entityPixi.play(deltaTime);
            // entity._debugFacingGraphic();
            entity.entityPixi._debugEntityId();
        }

        if (this.paused) {
            this.currentInteraction = undefined;
            return;
        }

        //do coroutines
        for (const coroutine of this.coroutines) {
            const result = coroutine.next();
            if (result.done) {
                this.coroutines.delete(coroutine);
            }
        }

        const animation = this.animationSytem!.getAnimation();
        if (animation) {
            animation.next();
            return;
        }

        for (const entityId of this.entityMapMarkedForCleanup) {
            const entity = this.entityMap.get(entityId);
            if (entity) {
                entity.entityPixi.destroy();
                this.entityMap.delete(entityId);
            }
        }

        if (this.levelWon) {
            return;
        }

        if (!this.currentInteraction) {
            return;
        }

        if (this.currentInteraction.interaction.type === "restart") {
            this.restart();
        }

        // Process the interaction and unset it
        const interaction = this.currentInteraction;
        this.currentInteraction = undefined;
        if (interaction.interaction.type === "wait" || interaction.interaction.type === "move") {
            this.actionProcessor.interactions.push(interaction);
        }
        if (interaction.interaction.type === "undo") {
            const actions = this.actionProcessor.doUndo();
            this.parseRules();
            this.animationSytem!.createAnimationsFromActions(actions, true);
            return;
        }

        let _doParse = false;
        const ADD_STEP = true;

        _doParse = this.actionProcessor.doMovement(interaction, ADD_STEP);
        // console.log("Movement performance", t1-t0);

        this.parseRules(_doParse);

        _doParse = this.actionProcessor.doMutations(ADD_STEP);

        this.parseRules(_doParse);

        let _d = this.actionProcessor.doDestruction(ADD_STEP);
        let _c = this.actionProcessor.doCreate(ADD_STEP);

        _doParse = _d || _c;

        this.parseRules(_doParse);

        const _isDead = this.checkYouAreDead();
        if (!_isDead) {
            const _isWin = this.checkYouWin();
        }

        const actions = this.actionProcessor.getTopOfStack();

        if (actions.length > 0) {
            this.animationSytem!.createAnimationsFromActions(this.actionProcessor.getTopOfStack(), false);
        }

        this.turnNumber++;

        //undo last Action[] on stack if actually no actions occured
        if (actions.length === 0) {
            this.actionProcessor.doUndo();
        }
    }
}

const wordYou = Word.findWordFromText("you");
const wordWin = Word.findWordFromText("win");
const wordText = Word.findWordFromText("text");