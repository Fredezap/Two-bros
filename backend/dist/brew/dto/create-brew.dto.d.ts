import { BrewStatus } from '@prisma/client';
export declare class CreateBrewDto {
    userId: string;
    recipeId: string;
    batchLiters: number;
    status?: BrewStatus;
    brewDate?: string;
    bottlingDate?: string | null;
    notes?: string;
    force?: boolean;
}
