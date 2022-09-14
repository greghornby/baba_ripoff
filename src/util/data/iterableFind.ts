export function iterableFind<T>(
    iterable: Iterable<T>,
    testFn: (item: T) => boolean
): T | undefined {
    for (const item of iterable) {
        if (testFn(item)) {
            return item;
        }
    }
    return undefined;
}