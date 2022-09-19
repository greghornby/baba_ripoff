export class Category {
    static store: Record<string, Category> = {};
    public name: string;
    public priority: number;
    constructor(
        data: CategoryData
    ) {
        this.name = data.name;
        this.priority = data.priority ?? 0;
        Category.store[this.name] = this;
    }
}

export interface CategoryData {
    name: string;
    priority: number;
}