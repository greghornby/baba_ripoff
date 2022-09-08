import { Construct } from "../../main/Construct.js";
import { Entity } from "../../main/Entity.js";
import { LevelController } from "../../main/LevelController.js";
import { IRule, Rule } from "../../main/Rule.js";
import { INounSelector, NounSelector, Word } from "../../main/Word.js";
import { arrayRemove } from "../arrayRemove.js";
import { setAddMultiple } from "../setAddMultiple.js";

export const setEntityTagsAndMutationsFromRule = (
    controller: LevelController,
    rule: Rule
) => {

    const complementIsTag = rule.rule.complement.word.behavior.tag;
    const complementIsMutation = rule.rule.complement.word.behavior.noun;
    if (!complementIsTag && !complementIsMutation) {
        return;
    }

    const levelConstructs = controller.getAllConstructsInLevel();

    const selectedEntities: Entity[] = selectEntities(controller, rule, levelConstructs);

    if (complementIsTag) {
        modifyTagsOnSelectedEntities(controller, rule, selectedEntities);
    } else if (complementIsMutation) {
        modifyMutationsOnSelectedEntities(controller, rule, levelConstructs, selectedEntities);
    }
}


const selectEntities = (controller: LevelController, rule: Rule, _levelConstructs: Construct[]): Entity[] => {
    const subject = rule.rule.subject;
    const subjectNot = subject.not;
    const subjectWord = subject.word;
    const selector = subjectWord.behavior.noun!.subject;

    const levelConstructs = [..._levelConstructs];
    if (subjectWord !== wordText) {
        const wordConstructs = levelConstructs.filter(c => c instanceof Word);
        arrayRemove(levelConstructs, ...wordConstructs);
    }

    if (selector instanceof NounSelector.single) {
        if (subjectNot) {
            const constructs = levelConstructs.filter(construct => construct !== selector.construct);
            return getEntitiesFromConstructsArray(controller, constructs);
        } else {
            return controller.getEntitiesOfConstruct(selector.construct);
        }
    } else if (selector instanceof NounSelector.compareLevelConstructs) {
        const constructs = levelConstructs.filter(construct => notFn(subjectNot, selector.compareFn(construct, subjectWord)));
        return getEntitiesFromConstructsArray(controller, constructs);
    } else {
        throw new Error(`Couldn't select Entities with subjectSelector ${JSON.stringify(selector)}`);
    }
}


const modifyTagsOnSelectedEntities = (controller: LevelController, rule: Rule, entities: Entity[]) => {
    const complement = rule.rule.complement;
    const complementNot = complement.not;
    const complementWord = complement.word;
    if (complementNot) {
        controller.tagToEntities.removeFromSet(complementWord, ...entities);
    } else {
        controller.tagToEntities.addToSet(complementWord, ...entities);
    }
    for (const entity of entities) {
        if (complementNot) {
            controller.entityToTags.removeFromSet(entity, complementWord);
        } else {
            controller.entityToTags.addToSet(entity, complementWord);
        }
    }
}


const modifyMutationsOnSelectedEntities = (controller: LevelController, rule: Rule, levelConstructs: Construct[], entities: Entity[]) => {
    const complement = rule.rule.complement;
    const complementNot = complement.not;
    const selector = complement.word.behavior.noun!.compliment;

    const fixedOutputConstructs =
        (selector instanceof NounSelector.single || selector instanceof NounSelector.compareLevelConstructs)
        && selectOutputConstructsNoEntity(selector, levelConstructs, complement);

    for (const entity of entities) {

        let constructs: Construct[];
        if (fixedOutputConstructs) {
            constructs = fixedOutputConstructs;
        } else {
            constructs = selectOutputConstructsWithEntity(selector as DynamicSelectors, levelConstructs, entity, complement);
        }

        // handle self mutation
        if (!complementNot) {
            for (const construct of constructs) {
                if (entity.construct === construct) {
                    controller.entityStrictlySelfMutations.add(entity);
                    controller.entityMutations.delete(entity);
                    continue;
                }
            }
        }

        if (controller.entityStrictlySelfMutations.has(entity)) {
            continue;
        }

        /** The Set of mutations this entity will undergo. We will manipulate this array with insertions or deletions */
        if (complementNot) {
            const entityNotMutations = controller.entityNotMutations.get(entity) ?? new Set();
            controller.entityNotMutations.set(entity, entityNotMutations);
            setAddMultiple(entityNotMutations, ...constructs);
        } else {
            const entityMutations = controller.entityMutations.get(entity) ?? new Set();
            controller.entityMutations.set(entity, entityMutations);
            const entityNotMutations = controller.entityNotMutations.get(entity);
            for (const construct of constructs) {
                //if this mutation is cancelled out by a NOT, add it to the mutations Set
                if (!entityNotMutations?.has(construct)) {
                    entityMutations.add(construct);
                }
            }
        }
    }
}


type FixedSelectors = InstanceType<INounSelector["single"] | INounSelector["compareLevelConstructs"]>;
type DynamicSelectors = Exclude<
    InstanceType<INounSelector[keyof INounSelector]>,
    FixedSelectors
>;
const selectOutputConstructsNoEntity = (
    selector: FixedSelectors,
    levelConstructs: Construct[],
    complement: IRule["complement"]
): Construct[] => {
    if (selector instanceof NounSelector.single) {
        return [selector.construct];
    } else {
        return levelConstructs.filter(construct => selector.compareFn(construct, complement.word));
    }
}


const selectOutputConstructsWithEntity = (
    selector: DynamicSelectors,
    levelConstructs: Construct[],
    entity: Entity,
    complement: IRule["complement"]
): Construct[] => {
    if (selector instanceof NounSelector.compareLevelConstructsWithEntityFunction) {
        return levelConstructs.filter(construct => selector.compareFn(entity, construct, complement.word));
    } else {
        return selector.entityFn(entity, complement.word);
    }
}

const notFn = (not: boolean, value: boolean) => not ? !value : value;

const getEntitiesFromConstructsArray = (controller: LevelController, constructs: Construct[]): Entity[] => {
    return constructs.reduce(
        (entities, construct) => {
            entities.push(...controller.getEntitiesOfConstruct(construct));
            return entities;
        },
        [] as Entity[]
    )
}

const wordText = Word.findWordFromText("text");