import { Construct } from "../../classes/Construct.js";
import { Entity } from "../../classes/Entity.js";
import { Cell, InitLevelData, LevelGrid, LevelRow } from "../../classes/Level.js";

export function makeLevelGridFromString(
    _text: string,
    key: Record<string, Construct | Construct[] | null | undefined>,
    keyMapToSetter?: [cell: string, fn: (entity: Entity) => void][]
): InitLevelData["startingEntities"] {
    let text = _text;
    if (text.startsWith("\n")) {
        text = text.slice(1);
    }
    const rows = text.split("\n").map(row => row.trim());
    const grid: LevelGrid<Construct> = [];
    const entitySetters: ReturnType<InitLevelData["startingEntities"]>["entitySetters"] = [];

    let entitySetterIndex = 0;
    for (const [y, row] of rows.entries()) {
        const spritesRow: LevelRow<Construct> = [];
        grid.push(spritesRow);
        const columns = row.split("");
        for (let [x, cell] of columns.entries()) {
            let spritesCell: Cell<Construct>;
            if (cell === "?") {
                const setter = keyMapToSetter?.[entitySetterIndex];
                entitySetterIndex++;
                if (!setter) {
                    throw new Error("Setter not defined");
                }
                cell = setter[0];
                const fn = setter[1];
                entitySetters.push({x, y, fn});
            }
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

    return () => ({
        grid: grid,
        entitySetters: entitySetters
    });
}