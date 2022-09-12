export function generatePairsFromArray<T>(arr: T[]): [T,T][] {
    const pairs: [T, T][] = [];
    for (let i = 0; i < arr.length-1; i++) {
        const item = arr[i];
        for (let j = i+1; j < arr.length; j++) {
            const item2 = arr[j];
            pairs.push([item, item2]);
        }
    }
    return pairs;
}