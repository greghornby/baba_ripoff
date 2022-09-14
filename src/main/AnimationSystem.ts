import { Action } from "./Action.js";
import { Constants } from "./Constants.js";
import { LevelController } from "./LevelController.js";


export class AnimationSystem {

    static ANIMATION_LENGTH_MAGIC_NUMBER = 5;
    static ANIMATION_SPEED: number = Math.ceil(AnimationSystem.ANIMATION_LENGTH_MAGIC_NUMBER * (Constants.FRAMERATE/Constants.PIXI_DEFAULT_FRAMERATE));
    public steps: AnimationStep[] = [];
    animationIterator: Iterator<void> | undefined;

    constructor(public controller: LevelController) {

    }

    createAnimationsFromActions(actions: Action[], reverse: boolean) {
        if (actions.length === 0) {
            return;
        }
        let stepCount: number = actions[reverse ? actions.length - 1 : 0].step;
        let currentStep: AnimationStep = {};
        this.steps.push(currentStep);
        for (
            let i = reverse ? actions.length - 1 : 0;
            reverse ? i > -1 : i < actions.length;
            reverse ? i-- : i++
        ) {
        // for (const {data: action, step} of actions) {
            const  {data: action, step} = actions[i];
            if (stepCount !== step) {
                stepCount = step;
                currentStep = {};
                this.steps.push(currentStep);
            }
            if (action.type === "movement") {
                const movementMap: {} & AnimationStep["movement"] = (currentStep.movement = currentStep.movement ?? new Map());
                let sx: number, sy: number, ex: number, ey: number;
                if (reverse) {
                    ({startX: ex, startY: ey, endX: sx, endY: sy} = action);
                } else {
                    ({startX: sx, startY: sy, endX: ex, endY: ey} = action);
                }
                let entityMovement = movementMap.get(action.entityId);
                if (!entityMovement) {
                    entityMovement = {sx, sy, ex, ey};
                    movementMap.set(action.entityId, entityMovement);
                } else {
                    entityMovement.ex = ex;
                    entityMovement.ey = ey;
                }
            } else if (action.type === "swapin") {
                let swap: number[] = reverse
                    ? (currentStep.swapOut = currentStep.swapOut ?? [])
                    : (currentStep.swapIn = currentStep.swapIn ?? []);
                swap.push(action.entityId);
            } else if (action.type === "swapout") {
                let swap: number[] = reverse
                    ? (currentStep.swapIn = currentStep.swapIn ?? [])
                    : (currentStep.swapOut = currentStep.swapOut ?? []);
                swap.push(action.entityId);
            } else if (action.type === "create") {
                let arr: number[] = reverse
                    ? (currentStep.destroy = currentStep.destroy ?? [])
                    : (currentStep.create = currentStep.create ?? []);
                arr.push(action.entityId);
            } else if (action.type === "destroy") {
                let arr: number[] = reverse
                    ? (currentStep.create = currentStep.create ?? [])
                    : (currentStep.destroy = currentStep.destroy ?? []);
                arr.push(action.entityId);
            }
        }
    }


    public getAnimation(): AnimationSystem["animationIterator"] {
        if (this.animationIterator) {
            return this.animationIterator;
        }
        const step = this.steps[0];
        if (!step) {
            return;
        }
        this.animationIterator = this._makeAnimationIterator(step);
        return this.animationIterator;
    }


    public *_makeAnimationIterator(step: AnimationStep): Generator<void> {
        for (let f = 0; f < AnimationSystem.ANIMATION_SPEED; f++) {
            const isLastFrame = f === AnimationSystem.ANIMATION_SPEED - 1;

            if (step.movement) {
                for (const [entityId, {sx, sy, ex, ey}] of step.movement) {
                    const entity = this.controller.entityMap.get(entityId);
                    if (!entity) {
                        console.warn(`Entity not found for id ${entityId}`);
                        continue;
                    }
                    const dx = (ex - sx) / AnimationSystem.ANIMATION_SPEED;
                    const dy = (ey - sy) / AnimationSystem.ANIMATION_SPEED;
                    const x = isLastFrame ? ex : (sx + (f+1)*dx);
                    const y = isLastFrame ? ey : (sy + (f+1)*dy);
                    entity.entityPixi.setPosition(x, y);
                }
            }

            if (step.create) {
                //@todo implement animation maybe?
            }

            if (step.destroy) {
                //@todo implement animation, but make sprite invisible for now
                for (const entityId of step.destroy) {
                    const entity = this.controller.entityMap.get(entityId)!;
                    entity.entityPixi.setVisible(false);
                }
            }

            for (const [isSwapIn, entityIds] of [[true, step.swapIn], [false, step.swapOut]] as const) {
                if (!entityIds) {
                    continue;
                }
                const dy = 1 / AnimationSystem.ANIMATION_SPEED;
                const startValue = isSwapIn ? 0 : 1;
                const endValue = isSwapIn ? 1 : 0;
                const direction = isSwapIn ? 1 : -1;
                const x = 1;
                const y = isLastFrame ? endValue : startValue + direction*(f+1)*dy;
                for (const entityId of entityIds) {
                    const entity = this.controller.entityMap.get(entityId);
                    if (!entity) {
                        console.warn(`Entity not found for id ${entityId}`);
                        continue;
                    }
                    if (f === 0) {
                        entity.entityPixi.setVisible(true);
                    }
                    entity.entityPixi.setScale(x, y);

                }
            }

            if (!isLastFrame) {
                yield;
            }
        }

        this.animationIterator = undefined;
        this.steps = this.steps.filter(s => s !== step);
    }
}


type EntityId = number;
export interface AnimationStep {
    movement?: Map<EntityId, {sx: number; sy: number; ex: number; ey: number}>;
    swapIn?: EntityId[];
    swapOut?: EntityId[];
    create?: EntityId[];
    destroy?: EntityId[];
}