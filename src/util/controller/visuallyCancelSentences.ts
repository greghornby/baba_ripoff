import { LevelController } from "../../controllers/LevelController.js";
import { Entity } from "../../object_classes/Entity.js";
import { Rule } from "../../object_classes/Rule.js";
import { Sentence } from "../../object_classes/Sentence.js";

export function visuallyCancelSentences(
    controller: LevelController,
    sentenceToRules: Map<Sentence, Rule[]>
) {

    //@todo optimize this part
    for (const entity of controller.entities) {
        entity.setCancelledWord(false);
    }

    const wordEntityToRules = new Map<Entity, Rule[]>();
    const sentenceEntities = new Map<Sentence, {marked: Entity[]; cancelled: Entity[]}>();
    const cancelledEntities = new Set<Entity>();

    //populate wordEntityToRules
    for (const rule of controller.rules) {
        const entity0 = rule.rule.subject.entity;
        const entity1 = rule.rule.complement.entity;
        if (entity0 && entity1 && rule.fromSentence) {

            const v0 = wordEntityToRules.get(entity0) ?? [];
            wordEntityToRules.set(entity0, v0);
            v0.push(rule);

            const v1 = wordEntityToRules.get(entity1) ?? [];
            wordEntityToRules.set(entity1, v1);
            v1.push(rule);

            const s = sentenceEntities.get(rule.fromSentence) ?? {marked: [], cancelled: []};
            sentenceEntities.set(rule.fromSentence, s);
            s.marked.push(entity0, entity1);
        }
    }

    for (const rule of controller._cancelledRules) {
        const entity0 = rule.rule.subject.entity;
        const entity1 = rule.rule.complement.entity;
        if (entity0 && entity1 && rule.fromSentence) {
            for (const entity of [entity0, entity1]) {
                const entityRules = wordEntityToRules.get(entity)!;
                if (entityRules.every(rule => controller._cancelledRules.has(rule))) {
                    cancelledEntities.add(entity);
                    const sentenceEntitiesData = sentenceEntities.get(rule.fromSentence)!
                    sentenceEntitiesData.cancelled.push(entity);
                }
            }
        }
    }

    sentence:
    for (const [sentence, data] of sentenceEntities.entries()) {
        if (data.marked.length === data.cancelled.length) {
            if (sentence.entities) {
                for (const entity of sentence.entities) {
                    if (cancelledEntities.has(entity)) {
                        entity.setCancelledWord(true);
                    }
                }
                continue sentence;
            }
        }
        for (const entity of data.cancelled) {
            entity.setCancelledWord(true);
        }
    }
}