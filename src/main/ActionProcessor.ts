import { debugPrint } from "../debug/debugPrint.js";
import { words } from "../objects/words.js";
import { Facing } from "../types/Facing.js";
import { Action } from "./Action.js";
import { Entity } from "./Entity.js";
import { Interaction, InteractionMove } from "./Interaction.js";
import { Cell, Level } from "./Level.js";
import { LevelController } from "./LevelController.js";

export class ActionProcessor {

    public level: Level;
    public controller: LevelController;

    public _waitingForInteraction: boolean = true;
    public interactions: Interaction[] = [];

    public stack: Action[][] = [];
    public actionIndex: number = 0;

    constructor (controller: LevelController) {
        this.controller = controller;
        this.level = controller.level;
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

        for (let index = this.actionIndex; index < actions.length; index++) {
            const action = actions[index];
            switch (action.data.type) {
                case "movement":
                    this.controller.moveEntity(
                        action.data.entity,
                        action.data.endDirection,
                        action.data.startX,
                        action.data.startY,
                        action.data.endX,
                        action.data.endY
                    );
            }
            this.actionIndex = index;
        }
    }


    public reverseActionsOnTopOfStack() {
        const actions = this.getTopOfStack();

        for (let index = this.actionIndex - 1; index >= 0; index--) {
            const action = actions[index];
            switch (action.data.type) {
                case "movement":
                    this.controller.moveEntity(
                        action.data.entity,
                        action.data.startDirection,
                        action.data.endX,
                        action.data.endY,
                        action.data.startX,
                        action.data.startY
                    );
            }
            this.actionIndex = index;
        }
    }


    public doInteraction(interaction: Interaction): void {
        if (!this._waitingForInteraction) {
            return;
        }
        this.interactions.push(interaction);
        this._waitingForInteraction = false;
        debugPrint.interactions(JSON.stringify(interaction));

        if (interaction.interaction.type === "undo") {
            if (this.controller.turnNumber > 0) {
                this.controller.turnNumber--;
                this.actionIndex = this.getTopOfStack().length;
                this.reverseActionsOnTopOfStack();
                this.stack.length--;
            }
        } else {
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

            const movementActions = this._processMovement(interaction);
            movementActions.forEach(action => addAction(action));
            debugPrint.actions(JSON.stringify(debugActions, null, 2));
            this.playActionsOnTopOfStack();
        }

        setTimeout(() => {this._waitingForInteraction = true}, 50);
    }


    public _processMovement(interaction: Interaction): Action[] {

        const movementActions: Action[] = [];

        if (interaction.interaction.type === "move") {
            const wordYou = words.you;
            const youEntities = this.controller.tagToEntities.getSet(wordYou);

            // set all you Entities to the facing position
            for (const entity of youEntities) {
                const actions = this._attemptToCreateEntityMovementAction(entity, interaction.interaction.direction);
                movementActions.push(...actions);
            }
        }

        return movementActions;
    }


    public _attemptToCreateEntityMovementAction(
        startEntity: Entity,
        direction: Facing
    ): Action[] {

        let pathBlocked = false;
        let actions: Action[] = [];
        let nextEntities: Cell<Entity> = [startEntity];
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
                actions.push(new Action({
                    type: "movement",
                    startDirection: entity.facing,
                    endDirection: direction,
                    entity: entity,
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
        const wordStop = words.stop;
        const wordPush = words.push;
        /** @todo add pull */
        const entityTags = this.controller.entityToTags.getSet(entity);
        return entityTags.has(wordStop) || entityTags.has(wordPush);
    }


    public _entityIsPushable(entity: Entity): boolean {
        const wordPush = words.push;
        const entityTags = this.controller.entityToTags.getSet(entity);
        return entityTags.has(wordPush);
    }


    public doMutations() {
        for (const mutation of this.controller.entityMutations) {
            const [entityToChange, constructsToChangeTo] = mutation;
            this.controller.swapEntityWithConstructs(entityToChange, constructsToChangeTo);
        }
    }
}