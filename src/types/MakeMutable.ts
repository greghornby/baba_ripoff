export type MakeMutable<T> =
    T extends ReadonlySet<infer U> ? Set<U> :
    T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
    T extends ReadonlyArray<infer U> ? Array <U> :
    T extends Readonly<infer U> ? {-readonly [P in keyof U]: U[P]} :
    T;