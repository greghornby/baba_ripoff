import { Construct } from "../main/Construct.js";
import { Level } from "../main/Level.js";

export function makeLevelGridFromString(_text: string, key: Record<string, Construct | null | undefined>): Level["sprites"] {
    let text = _text;
    if (text.startsWith("\n")) {
        text = text.slice(1);
    }
    const rows = text.split("\n").map(row => row.trim());
    const grid: Level["sprites"] = [];

    for (const row of rows) {
        const spritesRow: Level["sprites"][number] = [];
        grid.push(spritesRow);
        const columns = row.split("");
        for (const cell of columns) {
            const sprite = key[cell];
            if (sprite === undefined) {
                throw new Error(`Cell ${cell} does not map to anything in key ${JSON.stringify(key, null, 2)}`);
            }
            spritesRow.push(sprite);
        }
    }

    return grid;
}