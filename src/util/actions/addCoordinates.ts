export function addCoordinates(position: T, delta: Readonly<T>, mutate: true): T;
export function addCoordinates(position: Readonly<T>, delta: Readonly<T>, mutate?: false): Readonly<T>;
export function addCoordinates(position: T | Readonly<T>, delta: Readonly<T>, mutate: boolean = true): T {
    if (mutate) {
        (position as T)[0] += delta[0];
        (position as T)[1] += delta[1];
        return position as T;
    } else {
        return [
            position[0] + delta[0],
            position[1] + delta[1]
        ];
    }
}

type T = [x: number, y: number];


export function overwriteCoordinates(
    toMutate: [x: number, y: number],
    withThis: [x: number, y: number]
): [x: number, y: number] {
    toMutate[0] = withThis[0];
    toMutate[1] = withThis[1];
    return toMutate;
}