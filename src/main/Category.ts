export class Category {
    public name: string;
    public zIndex: number;
    constructor(
        data: CategoryData
    ) {
        this.name = data.name;
        this.zIndex = data.zIndex ?? 0;
    }
}

export interface CategoryData {
    name: string;
    zIndex?: number;
}