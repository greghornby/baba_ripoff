export function arrayRemoveParallel<T, Y>(
    arrays: [T[], ...Y[][]],
    ...items: T[]
): [T[], ...Y[][]] {
    let x = arrays[0];
    for (const i of items) {
        const index = arrays[0].indexOf(i); //get index from first array
        if (index > -1) {
            for (const arr of arrays) {
                arr.splice(index, 1);
            }
        }
    }
    return arrays;
}