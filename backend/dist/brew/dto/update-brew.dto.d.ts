import { BrewStatus } from '@prisma/client';
export declare class UpdateBrewDto {
    userId?: string;
    recipeId?: string;
    batchLiters?: number;
    status?: BrewStatus;
    brewDate?: string;
    bottlingDate?: string;
    notes?: string;
}
