import { words } from "../src/data/words.js";
import { Word } from "../src/object_classes/Word.js";


test("findWordFromText", () => {
    const wordsMap: [Word, Word][] = [
        [Word.findWordFromText("not"), words.not],
        [Word.findWordFromText("is"), words.is],
        [Word.findWordFromText("baba"), words.baba],
        [Word.findWordFromText("you"), words.you]
    ];
    for (const item of wordsMap) {
        expect(item[0]).toBe(item[1]);
    }
});