import { PrismaService } from '../prisma.service';
import { CreateBrewDto } from './dto/create-brew.dto';
import { UpdateBrewDto } from './dto/update-brew.dto';
export type BrewPatchDto = {
    status?: string;
    bottlingDate?: string | Date;
    notes?: string;
};
export declare class BrewService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        recipe: {
            details: string | number | boolean | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
            ingredients: ({
                ingredient: import("@prisma/client/runtime").GetResult<{
                    id: string;
                    name: string;
                    type: string;
                    unitOfMeasure: string;
                    stock: import("@prisma/client/runtime").Decimal;
                    reorderThreshold: import("@prisma/client/runtime").Decimal;
                    isInStock: boolean;
                    version: number;
                    deletedAt: Date | null;
                }, unknown, never> & {};
            } & import("@prisma/client/runtime").GetResult<{
                recipeId: string;
                ingredientId: string;
                quantity: import("@prisma/client/runtime").Decimal;
                usageMoment: import(".prisma/client").UsageMoment | null;
                time: number | null;
                timeUnit: import(".prisma/client").TimeUnit | null;
                id: string;
            }, unknown, never> & {})[];
            style: (import("@prisma/client/runtime").GetResult<{
                id: string;
                name: string;
                description: string | null;
                deletedAt: Date | null;
            }, unknown, never> & {}) | null;
            id: string;
            userId: string;
            styleId: string | null;
            name: string;
            batchLiters: import("@prisma/client/runtime").Decimal;
            ibu: number | null;
            colorSrm: number | null;
            alcoholPercent: import("@prisma/client/runtime").Decimal | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: string;
        userId: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        recipeId: string;
        status: import(".prisma/client").BrewStatus;
        brewDate: Date;
        bottlingDate: Date | null;
        notes: string | null;
    }[]>;
    create(payload: CreateBrewDto & {
        force?: boolean;
    }): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        recipeId: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        status: import(".prisma/client").BrewStatus;
        brewDate: Date;
        bottlingDate: Date | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}>;
    update(id: string, payload: UpdateBrewDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        recipeId: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        status: import(".prisma/client").BrewStatus;
        brewDate: Date;
        bottlingDate: Date | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}>;
    cancel(id: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    patchBrew(id: string, data: BrewPatchDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        recipeId: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        status: import(".prisma/client").BrewStatus;
        brewDate: Date;
        bottlingDate: Date | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}>;
}
