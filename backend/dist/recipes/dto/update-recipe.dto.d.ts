export declare class UpdateRecipeDto {
    styleId?: string;
    name?: string;
    batchLiters?: number;
    ibu?: number;
    colorSrm?: number;
    alcoholPercent?: number;
    details?: {
        og?: number | null;
        fg?: number | null;
        mashWater?: number | null;
        spargeWater?: number | null;
        [key: string]: any;
    };
    ingredients?: any[];
}
