import { debugPrint } from "../debug/debugPrint.js";
import { Facing } from "../types/Facing.js";
import { Action } from "./Action.js";
import { Entity } from "./Entity.js";
import { Interaction } from "./Interaction.js";
import { Cell, Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import { Word } from "./Word.js";

export class ActionProcessor {

    public level: Level;
    public controller: LevelController;

    public interactions: Interaction[] = [];

    public step: number = 0;
    public stack: Action[][] = [];
    public actionIndex: number = 0;

    constructor (controller: LevelController) {
        this.controller = controller;
        this.level = controller.level;
    }


    public addStep(): void {
        this.step++;
    }


    public getTopOfStack(): Action[] {
        const length = this.controller.turnNumber+1;
        if (this.stack.length !== length) {
            this.stack.length = length;
            this.actionIndex = 0;
        }
        return (this.stack[this.controller.turnNumber] = this.stack[this.controller.turnNumber] ?? []);
    }


    /**
     * Returns true if new actions were played, otherwise false
     */
    public playActionsOnTopOfStack(addStep: boolean): boolean {
        const actions = this.getTopOfStack();
        let returnValue = false;

        for (let index = this.actionIndex; index < actions.length; index++) {
            returnValue = true;
            const action = actions[index];
            debugPrint.actions(action);
            switch (action.data.type) {
                case "movement":
                    this.controller.moveEntity(
                        // action.data.entity,
                        this.controller.entityMap.get(action.data.entityId)!,
                        action.data.endDirection,
                        action.data.startX,
                        action.data.startY,
                        action.data.endX,
                        action.data.endY
                    );
                    break;
                case "facing":
                    this.controller.faceEntity(this.controller.entityMap.get(action.data.entityId)!, action.data.toDirection);
                    break;
                case "swapout":
                    this.controller.swapOutEntity(action.data.entityId);
                    break;
                case "swapin":
                    this.controller.swapInEntity(
                        action.data.entityId,
                        action.data.construct,
                        action.data.x,
                        action.data.y
                    );
                    break;
                case "create":
                    this.controller.addEntity({
                        construct: action.data.construct,
                        x: action.data.x,
                        y: action.data.y
                    }, {restoredId: action.data.entityId, visibleOnInit: true});
                    break;
                case "destroy":
                    this.controller.breakEntity(this.controller.entityMap.get(action.data.entityId)!);
                    break;
            }
            this.actionIndex = index+1;
        }

        if (addStep) {
            this.addStep();
        }

        return returnValue;
    }


    public reverseActionsOnTopOfStack(): Action[] {
        const actions = this.getTopOfStack();

        for (let index = this.actionIndex - 1; index >= 0; index--) {
            const action = actions[index];
            switch (action.data.type) {
                case "movement":
                    this.controller.moveEntity(
                        // action.data.entity,
                        this.controller.entityMap.get(action.data.entityId)!,
                        action.data.startDirection,
                        action.data.endX,
                        action.data.endY,
                        action.data.startX,
                        action.data.startY
                    );
                    break;
                case "facing":
                    this.controller.faceEntity(this.controller.entityMap.get(action.data.entityId)!, action.data.fromDirection);
                    break;
                case "swapout":
                    this.controller.swapInEntity(
                        action.data.entityId,
                        action.data.construct,
                        action.data.x,
                        action.data.y
                    );
                    break;
                case "swapin":
                    this.controller.swapOutEntity(action.data.entityId);
                    break;
                case "create":
                    this.controller.removeEntity(this.controller.entityMap.get(action.data.entityId)!, {instant: false});
                    break;
                case "destroy":
                    this.controller.addEntity({
                        construct: action.data.construct,
                        x: action.data.x,
                        y: action.data.y
                    }, {restoredId: action.data.entityId, visibleOnInit: true});
                    break;
            }
            this.actionIndex = index;
        }

        return actions;
    }


    public doUndo(): Action[] {
        if (this.controller.turnNumber === 0) {
            return [];
        }
        this.controller.turnNumber--;
        this.interactions.pop();
        this.actionIndex = this.getTopOfStack().length;
        const actions = this.reverseActionsOnTopOfStack();
        this.stack.length--;
        return actions;
    }


    public doMovement(interaction: Interaction, addStep: boolean): boolean {
        this.interactions.push(interaction);
        debugPrint.interactions(JSON.stringify(interaction));

        if (!(interaction.interaction.type === "move" || interaction.interaction.type === "wait")) {
            return false;
        }

        const topOfStack = this.getTopOfStack();
        const debugActions: Action[] = [];
        const actionsHashSet = new Set<string>();
        const addAction = (action: Action) => {
            if (!actionsHashSet.has(action.hash)) {
                topOfStack.push(action);
                debugActions.push(action);
                actionsHashSet.add(action.hash);
            }
        }

        if (interaction.interaction.type === "move") {
            const youEntities = this.controller.tagToEntities.get(wordYou);

            // set all you Entities to the facing position
            if (youEntities) {
                for (const entity of youEntities) {
                    const actions = this._attemptToCreateEntityMovementAction(entity, interaction.interaction.direction);
                    for (const action of actions) {
                        addAction(action);
                    }
                }
            }
        }

        return this.playActionsOnTopOfStack(addStep);
    }


    public _attemptToCreateEntityMovementAction(
        startEntity: Entity,
        direction: Facing
    ): Action[] {

        let pathBlocked = false;
        let actions: Action[] = [];
        let nextEntities: Readonly<Cell<Entity>> = [startEntity];
        const nextPoint: [number, number] = [startEntity.x, startEntity.y];
        const originEntityPoint = [...nextPoint];
        let pullCheck = false;

        const originFacingAction = startEntity.facing === direction ? undefined : new Action(this.step, {
            type: "facing",
            entityId: startEntity.id,
            fromDirection: startEntity.facing,
            toDirection: direction
        });

        let pullCheckIterationsRemaining = 1e3;
        while (pullCheckIterationsRemaining--) {
            let _cacheNextPoint = [nextPoint[0], nextPoint[1]];
            this._movePoint(nextPoint, direction, true);
            const previousCell = this.controller.getGridCell(nextPoint[0], nextPoint[1]);
            const foundPullEntities = previousCell?.filter(e => this.controller.entityToTags.get(e)?.has(wordPull));
            if (!foundPullEntities || foundPullEntities.length === 0) {
                nextPoint[0] = _cacheNextPoint[0];
                nextPoint[1] = _cacheNextPoint[1];
                break;
            } else {
                pullCheck = true;
                nextEntities = foundPullEntities;
            }
        }


        type ToMove = [entity: Entity, startX: number, startY: number, endX: number, endY: number];
        let pullBlocked = false;
        const entitiesToMove: ToMove[] = [];
        const pullEntitiesToMove: ToMove[] = [];

        // while loop failsafe
        let iterationsRemaining = 1e3;
        while (iterationsRemaining--) {

            const isOrigin = nextPoint[0] === originEntityPoint[0] && nextPoint[1] === originEntityPoint[1];

            if (pullCheck && pullBlocked) {
                continue;
            }

            let cellBlocked = false;
            let checkAgain = false;

            const toMove: Entity[] = [];

            for (const nextEntity of nextEntities) {
                if (nextEntity === startEntity) {
                    toMove.push(nextEntity);
                    checkAgain = true;
                    break;
                }
                if (!this._entityIsSolid(nextEntity)) {
                    continue;
                }
                if (!this._entityIsPushable(nextEntity, isOrigin ? false : pullCheck)) {
                    if (pullCheck) {
                        pullBlocked = true;
                        continue;
                    } else {
                        cellBlocked = true;
                        break;
                    }
                }
                toMove.push(nextEntity);
                checkAgain = true;
            }

            if (pullCheck && isOrigin) {
                pullCheck = false;
            }

            if (cellBlocked) {
                pathBlocked = true;
                break;
            }

            if (!checkAgain) {
                break;
            }

            let [startX, startY] = nextPoint;

            this._movePoint(nextPoint, direction);

            //move action
            for (const entity of toMove) {
                (pullCheck ? pullEntitiesToMove : entitiesToMove).push([
                    entity,
                    startX,
                    startY,
                    nextPoint[0],
                    nextPoint[1]
                ]);
            }

            const nextCell = this.controller.getGridCell(nextPoint[0], nextPoint[1]);
            if (!nextCell) {
                pathBlocked = true;
                break;
            }
            nextEntities = nextCell;
        }

        if (!pullBlocked) {
            entitiesToMove.unshift(...pullEntitiesToMove);
        }

        for (const [entity, startX, startY, endX, endY] of entitiesToMove) {
            if (entity !== startEntity && entity.facing !== direction) {
                actions.push(new Action(this.step, {
                    type: "facing",
                    entityId: entity.id,
                    fromDirection: entity.facing,
                    toDirection: direction
                }));
            }
            actions.push(new Action(this.step, {
                type: "movement",
                startDirection: entity.facing,
                endDirection: direction,
                // entity: entity,
                entityId: entity.id,
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            }));
        }

        if (pathBlocked) {
            if (originFacingAction) {
                return [originFacingAction];
            }
            return [];
        }

        if (originFacingAction) {
            actions.unshift(originFacingAction);
        }
        return actions;
    }


    public _movePoint(point: [x: number, y: number], direction: Facing, oppositeDirection: boolean = false): void {
        switch (direction) {
            case Facing.left:
                oppositeDirection ? point[0]++ : point[0]--;
                break;
            case Facing.right:
                oppositeDirection ? point[0]-- : point[0]++;
                break;
            case Facing.up:
                oppositeDirection ? point[1]++ : point[1]--;
                break;
            case Facing.down:
                oppositeDirection ? point[1]-- : point[1]++;
                break;
        }
    }


    public _entityIsSolid(entity: Entity): boolean {
        /** @todo add pull */
        const entityTags = this.controller.entityToTags.get(entity);
        if (entityTags) {
            return entityTags.has(wordStop) || entityTags.has(wordPush) || entityTags.has(wordPull);
        } else {
            return false;
        }
    }


    public _entityIsPushable(entity: Entity, pullCheck: boolean): boolean {
        const entityTags = this.controller.entityToTags.get(entity);
        if (entityTags) {
            if (pullCheck) {
                return entityTags.has(wordPush) || entityTags.has(wordPull);
            } else {
                return entityTags.has(wordPush);
            }
        } else {
            return false;
        }
    }


    public doMutations(addStep: boolean): boolean {
        const actions: Action[] = [];
        for (const mutation of this.controller.entityVerbs.is) {
            const [entityToChange, constructsToChangeTo] = mutation;
            if (constructsToChangeTo.size === 0) {
                continue;
            }
            const debugData = {
                fromEntity: entityToChange.name,
                toConstructs: constructsToChangeTo//.map(c => c.associatedWord()._string)
            };
            const swapOutAction = new Action(this.step, {
                type: "swapout",
                entityId: entityToChange.id,
                construct: entityToChange.construct,
                x: entityToChange.x,
                y: entityToChange.y
            }, debugData);
            actions.push(swapOutAction);
            for (const construct of constructsToChangeTo) {
                const debugData = {
                    fromEntity: entityToChange.name,
                    construct: construct.associatedWord()._string
                }
                const swapInAction = new Action(this.step, {
                    type: "swapin",
                    entityId: this.controller.entityCount++,
                    construct: construct,
                    x: entityToChange.x,
                    y: entityToChange.y
                }, debugData);
                actions.push(swapInAction);
            }
        }
        this.controller.entityVerbs.is.clear();
        const topOfStack = this.getTopOfStack();
        topOfStack.push(...actions);
        return this.playActionsOnTopOfStack(addStep);
    }


    public doDestruction(addStep: boolean): boolean {

        const topOfStack = this.getTopOfStack();
        const entitiesToDestroy: Entity[] = [];

        //check for X IS NOT X
        for (const [entity, notConstructs] of this.controller.entityVerbs.isNot.entries()) {
            if (notConstructs.has(entity.construct)) {
                entitiesToDestroy.push(entity);
            }
        }

        //check for YOU AND DEFEAT
        const youEntities = this.controller.tagToEntities.get(wordYou);
        if (youEntities) {
            for (const you of youEntities) {
                const entitiesOnSameCell = this.controller.getEntitiesAtPosition(you.x, you.y);
                for (const cellEntity of entitiesOnSameCell) {
                    const tags = this.controller.entityToTags.get(cellEntity);
                    if (tags && tags.has(wordDefeat)) {
                        entitiesToDestroy.push(you);
                    }
                }
            }
        }

        for (const entity of entitiesToDestroy) {
            const action = new Action(this.step, {
                type: "destroy",
                entityId: entity.id,
                construct: entity.construct,
                x: entity.x,
                y: entity.y
            });
            topOfStack.push(action);
        }

        return this.playActionsOnTopOfStack(addStep);
    }


    public doCreate(addStep: boolean): boolean {

        const topOfStack = this.getTopOfStack();
        const entitiesToCreate: Entity[] = [];

        for (const entity of entitiesToCreate) {
            const action = new Action(this.step, {
                type: "destroy",
                entityId: entity.id,
                construct: entity.construct,
                x: entity.x,
                y: entity.y
            });
            topOfStack.push(action);
        }

        return this.playActionsOnTopOfStack(addStep);
    }
}

const wordYou = Word.findWordFromText("you");
const wordStop = Word.findWordFromText("stop");
const wordPush = Word.findWordFromText("push");
const wordPull = Word.findWordFromText("pull");
const wordDefeat = Word.findWordFromText("defeat");