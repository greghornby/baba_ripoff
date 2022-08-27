import { getPaths } from "../src/util/getPaths.js";

test("getPaths", () => {

    const tree1: string[][] = [
        ["a"],
        ["b", "c"],
        ["d"]
    ];

    const expected1: string[][] = [
        ["a", "b", "d"],
        ["a", "c", "d"]
    ];

    const tree2: string[][] = [
        ["0", "1"],
        ["a"],
        ["0", "1"],
        ["a"],
        ["b"],
        ["0", "1"]
    ];

    const expected2: string[][] = [
        ["0", "a", "0", "a", "b", "0"],
        ["0", "a", "0", "a", "b", "1"],
        ["0", "a", "1", "a", "b", "0"],
        ["0", "a", "1", "a", "b", "1"],
        ["1", "a", "0", "a", "b", "0"],
        ["1", "a", "0", "a", "b", "1"],
        ["1", "a", "1", "a", "b", "0"],
        ["1", "a", "1", "a", "b", "1"],
    ];

    const allPaths = getPaths(tree2);

    console.log("Paths", allPaths);

    expect(getPaths(tree1)).toEqual(expected1);
    expect(getPaths(tree2)).toEqual(expected2);

})