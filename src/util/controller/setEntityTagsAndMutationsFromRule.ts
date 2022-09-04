import { Construct } from "../../main/Construct.js";
import { Entity } from "../../main/Entity.js";
import { LevelController } from "../../main/LevelController.js";
import { Rule } from "../../main/Rule.js";
import { NounSelectionFunction, Word } from "../../main/Word.js";
import { arrayRemove } from "../arrayRemove.js";

export const setEntityTagsAndMutationsFromRule = (
    controller: LevelController,
    _rule: Rule
) => {
    const {rule} = _rule;

    const complementNot = rule.complement.not;
    const complementWord = rule.complement.word;
    const complementIsTag = rule.complement.word.behavior.tag;
    const complementIsMutation = rule.complement.word.behavior.noun;

    if (!complementIsTag && !complementIsMutation) {
        return;
    }

    const levelConstructs = controller.getAllConstructsInLevel();

    const subjectNot = rule.subject.not;
    const subjectWord = rule.subject.word;
    const subjectNoun = subjectWord.behavior.noun!;

    if (subjectWord !== wordText) {
        for (const c of levelConstructs) {
            if (c instanceof Word) {
                arrayRemove(levelConstructs, c);
            }
        }
    }

    const subjectSelector = subjectNoun.type === "single" ? subjectNoun.selector : subjectNoun.subject;

    const selectorFn = (construct: Construct): boolean => {
        let result: boolean;
        if (subjectSelector instanceof Construct) {
            result = construct === subjectSelector;
        } else {
            result = (subjectSelector as NounSelectionFunction)(construct, subjectWord, controller.level);
        }
        if (subjectNot) {
            result = !result;
        }
        return result;
    };

    const selectedConstructs = levelConstructs.filter(selectorFn);

    const entities: Entity[] = selectedConstructs.reduce(
        (entities, construct) => {
            entities.push(...controller.getEntitiesOfConstruct(construct));
            return entities;
        },
        [] as Entity[]
    );

    if (complementIsTag) {
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
    } else if (complementIsMutation) {
        for (const entity of entities) {
            const complementNoun = complementWord.behavior.noun!;
            const complementSelector = complementNoun.type === "single" ? complementNoun.selector : complementNoun.complement;
            const mutateToConstructs =
                complementSelector instanceof Construct
                ? [complementSelector]
                : levelConstructs.filter(construct => (complementSelector as NounSelectionFunction)(construct, complementWord, controller.level));
            const entityToConstructs = controller.entityMutations.get(entity) ?? [];
            if (complementNot) {
                if (entityToConstructs.length > 0) {
                    arrayRemove(entityToConstructs, ...mutateToConstructs);
                }
            } else {
                entityToConstructs.push(...mutateToConstructs);
            }
            controller.entityMutations.set(entity, entityToConstructs);
        }
    }
}


const wordText = Word.findWordFromText("text");