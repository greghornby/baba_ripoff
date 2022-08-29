import { words } from "../objects/words.js";
import { Facing } from "../types/Facing.js";
import { Action } from "./Action.js";
import { Entity } from "./Entity.js";
import { Interaction, InteractionMove } from "./Interaction.js";
import { Cell, Level } from "./Level.js";
import { LevelController } from "./LevelController.js";
import objectHash from "object-hash";

export class ActionProcessor {

    public level: Level;
    public controller: LevelController;

    public _waitingForInteraction: boolean = true;
    public interactions: Interaction[] = [];

    public stack: Action[][] = [];

    constructor (controller: LevelController) {
        this.controller = controller;
        this.level = controller.level;
    }


    public processInteraction(interaction: Interaction): void {
        if (!this._waitingForInteraction) {
            return;
        }
        this.interactions.push(interaction);
        this._waitingForInteraction = false;
        console.log("Processing interaction", JSON.stringify(interaction));

        if (interaction.interaction.type === "undo") {
            this.reverseActionsOnTopOfStack();
        } else {
            const actions: Action[] = [];
            this.stack.push(actions);

            const movementActions = this.processMovement(interaction);
            console.log("Movement actions", movementActions);
            actions.push(...movementActions);
            this.playActionsOnTopOfStack();
        }

        setTimeout(() => {this._waitingForInteraction = true}, 50);
    }


    public playActionsOnTopOfStack() {
        const actions = this.stack[this.stack.length - 1];

        for (const action of actions) {
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
        }
    }


    public reverseActionsOnTopOfStack() {
        const actions = this.stack.pop() ?? [];

        for (const action of actions) {
            switch (action.data.type) {
                case "movement":
                    this.controller.moveEntity(
                        action.data.entity,
                        action.data.startDirection,
                        action.data.endX,
                        action.data.endY,
                        action.data.startX,
                        action.data.startY
                    )
            }
        }
    }


    public dedupeActions(actions: Action[]) {
        const hashes = new Set<string>();
        const dedupedActions: Action[] = [];
        for (const action of actions) {
            let obj: Record<string, string | number>;
            switch (action.data.type) {
                case "movement":
                    const {entity, ...rest} = action.data;
                    obj = {
                        ...rest,
                        entityId: entity.id
                    };
                break;
                default:
                    obj = {};
            }
            const hash = objectHash(obj);
            if (!hashes.has(hash)) {
                dedupedActions.push(action);
            }
        }
        return dedupedActions;
    }


    public processMovement(interaction: Interaction): Action[] {

        const movementActions: Action[] = [];

        if (interaction.interaction.type === "move") {
            const wordYou = words.you;
            const youEntities = this.controller.tagToEntities.getSet(wordYou);

            // set all you Entities to the facing position
            for (const entity of youEntities) {
                const actions = this.attemptToCreateEntityMovementAction(entity, interaction.interaction.direction);
                movementActions.push(...actions);
            }
        }

        return this.dedupeActions(movementActions);
    }


    public attemptToCreateEntityMovementAction(
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
}