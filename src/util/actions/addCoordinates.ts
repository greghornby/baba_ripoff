export function addCoordinates(
    position: [x: number, y: number],
    delta: [x: number, y: number],
    mutate: boolean = true
): [x: number, y: number] {
    if (mutate) {
        position[0] += delta[0];
        position[1] += delta[1];
        return position;
    } else {
        return [
            position[0] + delta[0],
            position[1] + delta[1]
        ];
    }
}


export function overwriteCoordinates(
    toMutate: [x: number, y: number],
    withThis: [x: number, y: number]
): [x: number, y: number] {
    toMutate[0] = withThis[0];
    toMutate[1] = withThis[1];
    return toMutate;
}