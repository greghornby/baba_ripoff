export function getPaths<T>(tree: T[][], allPaths: T[][] = [], currentPath: T[] = []): T[][] {
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
