import { IngredientType } from './create-ingredient.dto';
export declare class UpdateIngredientDto {
    name?: string;
    type?: IngredientType;
    unitOfMeasure?: string;
    stock?: number;
    reorderThreshold?: number;
    isInStock?: boolean;
}
