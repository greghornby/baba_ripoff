import { Word } from "../../object_classes/Word.js";

export type VerbUnion = "is" | "has" | "make";

export function verbEquals(word: Word, verb: VerbUnion): boolean {
    const value = mapVerbToString(word);
    return value === verb;
}


export function mapVerbToString(word: Word): VerbUnion | undefined {
    switch (word) {
        case wordIs: return "is";
        case wordHas: return "has";
        case wordMake: return "make";
        default: return undefined;
    }
}

const wordIs = Word.findWordFromText("is");
const wordHas = Word.findWordFromText("has");
const wordMake = Word.findWordFromText("make");