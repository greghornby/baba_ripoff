export const arrayRemove = <T>(arr:  T[], ...items: T[]): T[] => {
    for (const i of items) {
        const index = arr.indexOf(i);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
    return arr;
}