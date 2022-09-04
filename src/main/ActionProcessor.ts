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


    public playActionsOnTopOfStack() {
        const actions = this.getTopOfStack();

        // console.log(`Playing ${actions.length - this.actionIndex} Actions from index ${this.actionIndex}`, actions[this.actionIndex]);

        for (let index = this.actionIndex; index < actions.length; index++) {
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
            }
            this.actionIndex = index+1;
        }
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


    public doMovement(interaction: Interaction): void {
        this.interactions.push(interaction);
        debugPrint.interactions(JSON.stringify(interaction));

        if (!(interaction.interaction.type === "move" || interaction.interaction.type === "wait")) {
            return;
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
            const youEntities = this.controller.tagToEntities.getSet(wordYou);

            // set all you Entities to the facing position
            for (const entity of youEntities) {
                const actions = this._attemptToCreateEntityMovementAction(entity, interaction.interaction.direction);
                for (const action of actions) {
                    addAction(action);
                }
            }
        }

        this.playActionsOnTopOfStack();
    }


    public _attemptToCreateEntityMovementAction(
        startEntity: Entity,
        direction: Facing
    ): Action[] {

        let pathBlocked = false;
        let actions: Action[] = [];
        let nextEntities: Readonly<Cell<Entity>> = [startEntity];
        let nextX = startEntity.x;
        let nextY = startEntity.y;

        // while loop failsafe
        let iterationsRemaining = 1e3;

        while (iterationsRemaining--) {

            let cellBlocked = false;
            let checkAgain = false;

            let entitiesToMove: Entity[] = [];

            for (const nextEntity of nextEntities) {
                if (nextEntity === startEntity) {
                    entitiesToMove.push(nextEntity);
                    checkAgain = true;
                    break;
                }
                if (!this._entityIsSolid(nextEntity)) {
                    continue;
                }
                if (!this._entityIsPushable(nextEntity)) {
                    cellBlocked = true;
                    break;
                }
                entitiesToMove.push(nextEntity);
                checkAgain = true;
            }

            if (cellBlocked) {
                pathBlocked = true;
                break;
            }

            if (!checkAgain) {
                break;
            }

            let startX = nextX;
            let startY = nextY;

            switch (direction) {
                case Facing.left:
                    nextX--;
                    break;
                case Facing.right:
                    nextX++;
                    break;
                case Facing.up:
                    nextY--;
                    break;
                case Facing.down:
                    nextY++;
                    break;
            }

            for (const entity of entitiesToMove) {
                actions.push(new Action(this.step, {
                    type: "movement",
                    startDirection: entity.facing,
                    endDirection: direction,
                    // entity: entity,
                    entityId: entity.id,
                    startX: startX,
                    startY: startY,
                    endX: nextX,
                    endY: nextY
                }));
            }

            const nextCell = this.controller.getGridCell(nextX, nextY);
            if (!nextCell) {
                pathBlocked = true;
                break;
            }
            nextEntities = nextCell;
        }

        if (pathBlocked) {
            return [];
        }

        return actions;
    }


    public _entityIsSolid(entity: Entity): boolean {
        /** @todo add pull */
        const entityTags = this.controller.entityToTags.getSet(entity);
        return entityTags.has(wordStop) || entityTags.has(wordPush);
    }


    public _entityIsPushable(entity: Entity): boolean {
        const entityTags = this.controller.entityToTags.getSet(entity);
        return entityTags.has(wordPush);
    }


    public doMutations() {
        const actions: Action[] = [];
        for (const mutation of this.controller.entityMutations) {
            const [entityToChange, constructsToChangeTo] = mutation;
            const debugData = {
                fromEntity: entityToChange.name,
                toConstructs: constructsToChangeTo.map(c => c.associatedWord()._string)
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
        this.controller.entityMutations.clear();
        const topOfStack = this.getTopOfStack();
        topOfStack.push(...actions);
        this.playActionsOnTopOfStack();
    }
}

const wordYou = Word.findWordFromText("you");
const wordStop = Word.findWordFromText("stop");
const wordPush = Word.findWordFromText("push");