export const setRemoveMultiple = <T>(s: Set<T>, ...items: T[]): Set<T> => {
    for (const item of items) {
        s.delete(item);
    }
    return s;
}