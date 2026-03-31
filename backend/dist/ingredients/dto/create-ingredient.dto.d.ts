export declare enum IngredientType {
    MALT = "malt",
    HOP = "hop",
    YEAST = "yeast",
    OTHER = "other"
}
export declare class CreateIngredientDto {
    name: string;
    type: IngredientType;
    unitOfMeasure: string;
    stock: number;
    reorderThreshold?: number;
    isInStock?: boolean;
}
