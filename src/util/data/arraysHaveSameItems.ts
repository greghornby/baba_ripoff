export function arraysHaveSameItems<T>(arrA: T[], arrB: T[], optimizeWithSet?: boolean): boolean {
    if (arrA.length !== arrB.length) {
        return false;
    }
    if (optimizeWithSet) {
        const bSet = new Set(arrB);
        for (const item of arrA) {
            if (!bSet.has(item)) {
                return false;
            }
        }
    } else {
        for (const item of arrA) {
            if (!arrB.includes(item)) {
                return false;
            }
        }
    }
    return true;
}