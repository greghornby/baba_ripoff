import { Word } from "../../classes/Word.js";

export function getWordMap<K extends string>(...args: K[]): Record<K, Word> {
    return Object.fromEntries(args.map(tag => [tag, Word.findWordFromText(tag)])) as Record<K, Word>;
}