import { Construct } from "../main/Construct.js";
import { InitLevelData, Level, LevelCell, LevelGrid, LevelRow } from "../main/Level.js";

export function makeLevelGridFromString(_text: string, key: Record<string, Construct | Construct[] | null | undefined>): () => LevelGrid {
    let text = _text;
    if (text.startsWith("\n")) {
        text = text.slice(1);
    }
    const rows = text.split("\n").map(row => row.trim());
    const grid: LevelGrid = [];

    for (const row of rows) {
        const spritesRow: LevelRow = [];
        grid.push(spritesRow);
        const columns = row.split("");
        for (const cell of columns) {
            let spritesCell: LevelCell;
            const sprite = key[cell];
            if (sprite === undefined) {
                throw new Error(`Cell ${cell} does not map to anything in key ${JSON.stringify(key, null, 2)}`);
            } else if (sprite === null) {
               spritesCell = [];
            } else if (Array.isArray(sprite)) {
                spritesCell = sprite;
            } else {
                spritesCell = [sprite];
            }
            spritesRow.push(spritesCell);
        }
    }

    return () => grid;
}