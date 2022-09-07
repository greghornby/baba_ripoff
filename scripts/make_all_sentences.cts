function getPaths<T>(tree: T[][], allPaths: T[][] = [], currentPath: T[] = []): T[][] {
    const [cell, ...restOfTree] = tree;
    for (const item of cell) {
        let nextPath: T[] = [...currentPath, item];
        if (restOfTree.length > 0) {
            getPaths(restOfTree, allPaths, nextPath);
        } else {
            allPaths.push(nextPath);
        }
    }
    return allPaths;
}


const SENTENCE_STRUCTURE = `[NOT] X IS [NOT] A, [NOT] Y IS [NOT] B | [X=Y] [A=B] [A=X]`;

const STRUCTURE = [
    ["", "NOT"],
    ["X"],
    ["IS"],
    ["", "NOT"],
    ["A", "X"],
    [","],
    ["", "NOT"],
    ["Y", "X"],
    ["IS"],
    ["", "NOT"],
    ["B", "A"]
];

const sentences = getPaths(STRUCTURE);

for (const sentence of sentences) {
    console.log(sentence.join(" "));
}

export default {}