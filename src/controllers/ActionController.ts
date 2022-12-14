import { Action } from "../classes/Action.js";
import { Entity } from "../classes/Entity.js";
import { Level } from "../classes/Level.js";
import { debugPrint } from "../debug/debugPrint.js";
import { Interaction } from "../types/Interaction.js";
import { destructiblePairs } from "../util/controller/destructiblePairs.js";
import { getWordMap } from "../util/words/getWordMap.js";
import { doMovement } from "./doMovement/doMovement.js";
import { LevelController } from "./LevelController.js";

export class ActionController {

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
                        this.controller.entityMap.get(action.data.entityId)!,
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
                    this.controller.faceEntity(this.controller.entityMap.get(action.data.entityId)!, action.data.facing);
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
        return doMovement.call(this, interaction, addStep);
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
                facing: entityToChange.facing,
                x: entityToChange.x,
                y: entityToChange.y
            }, debugData);
            actions.push(swapOutAction);
            for (const construct of constructsToChangeTo) {
                const debugData = {
                    fromEntity: entityToChange.name,
                    construct: construct.name
                }
                const swapInAction = new Action(this.step, {
                    type: "swapin",
                    entityId: this.controller.entityCount++,
                    construct: construct,
                    facing: entityToChange.facing,
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

        entitiesToDestroy.push(
            ...destructiblePairs()
        );

        for (const entity of entitiesToDestroy) {
            const action = new Action(this.step, {
                type: "destroy",
                entityId: entity.id,
                construct: entity.construct,
                facing: entity.facing,
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
                type: "create",
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

const words = getWordMap("you", "defeat", "shut", "open");

function doDebugActions(title: string, actions: Action[]) {
    console.log(`ACTIONS: ${title}`);
    for (const action of actions) {
        console.log(JSON.stringify(action));
    }
    console.log("\n\n");
}