export const setAddMultiple = <T>(s: Set<T>, ...items: T[]): Set<T> => {
    for (const item of items) {
        s.add(item);
    }
    return s;
}