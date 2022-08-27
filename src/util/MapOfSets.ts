export class MapOfSets<K, V> extends Map<K, Set<V>> {

    constructor() {
        super();
    }

    getSet(key: K): Set<V> {
        const value = this.get(key);
        if (value) {
            return value;
        } else {
            const value = new Set<V>();
            this.set(key, value);
            return value;
        }
    }

    getArray(key: K): V[] {
        return [...this.getSet(key)];
    }

    addToSet(key: K, ...items: V[]): this {
        const s = this.getSet(key);
        for (const item of items) {
            s.add(item);
        }
        return this;
    }

    removeFromSet(key: K, ...items: V[]): this {
        const s = this.getSet(key);
        for (const item of items) {
            s.delete(item);
        }
        return this;
    }

    clearSet(key: K) {
        this.getSet(key).clear();
        return this;
    }
}