import { Construct } from "../../classes/Construct.js";
import { Entity } from "../../classes/Entity.js";
import { IRule, Rule } from "../../classes/Rule.js";
import { INounSelector, NounSelector, Word } from "../../classes/Word.js";
import { LevelController } from "../../controllers/LevelController.js";
import { arrayRemove } from "../data/arrayRemove.js";
import { setAddMultiple } from "../data/setAddMultiple.js";
import { mapVerbToString, verbEquals } from "../rules/verbEquals.js";

export const setEntityTagsAndVerbsFromRule = (
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
        modifyVerbsOnSelectedEntities(controller, rule, levelConstructs, selectedEntities);
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
            controller.tagToEntities.removeFromSet(complementWord, entity);
            controller.entityToTags.removeFromSet(entity, complementWord);
            controller.entityToNotTags.addToSet(entity, complementWord);
        } else {
            if (!controller.entityToNotTags.get(entity)?.has(complementWord)) {
                controller.entityToTags.addToSet(entity, complementWord);
            }
        }
    }
}


const modifyVerbsOnSelectedEntities = (controller: LevelController, rule: Rule, levelConstructs: Construct[], entities: Entity[]) => {
    const complement = rule.rule.complement;
    const complementNot = complement.not;
    const selector = complement.word.behavior.noun!.compliment;
    const verb = rule.rule.verb.word;

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
        //@todo maybe don't need this check with the rule cancelling system
        if (verbEquals(verb, "is")) {

            if (!complementNot) {
                for (const construct of constructs) {
                    if (entity.construct === construct) {
                        controller.entityStrictlySelfMutations.add(entity);
                        controller.entityVerbs.is.delete(entity);
                        continue;
                    }
                }
            }

            if (controller.entityStrictlySelfMutations.has(entity)) {
                continue;
            }
        }

        /** Add or remove verbs from an entity */
        const verbProp = mapVerbToString(verb)!;
        const verbMap = controller.entityVerbs[verbProp];
        const notVerbMap = controller.entityVerbs[`${verbProp}Not`];
        if (complementNot) {
            const entityNotVerb = notVerbMap.get(entity) ?? new Set();
            notVerbMap.set(entity, entityNotVerb);
            setAddMultiple(entityNotVerb, ...constructs);
        } else {
            const entityVerb = verbMap.get(entity) ?? new Set();
            verbMap.set(entity, entityVerb);
            const entityNotVerb = notVerbMap.get(entity);
            for (const construct of constructs) {
                //if this mutation is not cancelled out by a NOT, add it to the mutations Set
                if (!entityNotVerb?.has(construct)) {
                    entityVerb.add(construct);
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