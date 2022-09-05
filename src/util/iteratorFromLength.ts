export function iteratorFromLength<T extends ObjectWithLengthAndIndex<any>>(obj: T): Iterable<T extends ObjectWithLengthAndIndex<infer I> ? I : never> {
    return gen(obj) as any;
}

function *gen<T extends ObjectWithLengthAndIndex<any>>(obj: T): Generator<unknown> {
    for (let i = 0; i < obj.length; i++) {
        yield obj[i];
    }
}

interface ObjectWithLengthAndIndex<I> {
    length: number;
    [index: number]: I
}