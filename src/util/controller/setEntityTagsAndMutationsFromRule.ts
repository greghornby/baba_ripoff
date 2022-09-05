import { Construct } from "../../main/Construct.js";
import { Entity } from "../../main/Entity.js";
import { LevelController } from "../../main/LevelController.js";
import { IRule, Rule } from "../../main/Rule.js";
import { INounSelector, NounSelector, Word } from "../../main/Word.js";
import { arrayRemove } from "../arrayRemove.js";

export const setEntityTagsAndMutationsFromRule = (
    controller: LevelController,
    _rule: Rule
) => {
    const {rule} = _rule;

    const complementIsTag = rule.complement.word.behavior.tag;
    const complementIsMutation = rule.complement.word.behavior.noun;
    if (!complementIsTag && !complementIsMutation) {
        return;
    }

    const levelConstructs = controller.getAllConstructsInLevel();

    const selectedEntities: Entity[] = selectEntities(controller, levelConstructs, rule.subject);

    if (complementIsTag) {
        modifyTagsOnSelectedEntities(controller, selectedEntities, rule.complement);
    } else if (complementIsMutation) {
        modifyMutationsOnSelectedEntities(controller, levelConstructs, selectedEntities, rule.complement);
    }
}


const selectEntities = (controller: LevelController, _levelConstructs: Construct[], subject: IRule["subject"]): Entity[] => {
    const subjectNot = subject.not;
    const subjectWord = subject.word;
    const selector = subjectWord.behavior.noun!.subject;

    const levelConstructs = [..._levelConstructs];
    if (subjectWord !== wordText) {
        for (const c of levelConstructs) {
            if (c instanceof Word) {
                arrayRemove(levelConstructs, c);
            }
        }
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


const modifyTagsOnSelectedEntities = (controller: LevelController, entities: Entity[], complement: IRule["complement"]) => {
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


const modifyMutationsOnSelectedEntities = (controller: LevelController, levelConstructs: Construct[], entities: Entity[], complement: IRule["complement"]) => {
    const complementNot = complement.not;
    const complementWord = complement.word;
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

        const entityToConstructs = controller.entityMutations.get(entity) ?? [];
        if (complementNot) {
            if (constructs.length > 0) {
                arrayRemove(entityToConstructs, ...constructs);
            }
        } else {
            entityToConstructs.push(...constructs);
        }
        controller.entityMutations.set(entity, entityToConstructs);
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

function* filterIterator<T>(
    iterator: Iterable<T>,
    compareFn: (value: T) => boolean
) {
    for (const i of iterator) {
        if (compareFn(i)) {
            yield i;
        }
    }
}


const wordText = Word.findWordFromText("text");