/// <reference types="cookie-parser" />
import { Response, Request } from 'express';
type JwtPayload = {
    sub: string;
    email: string;
};
interface RequestWithUser extends Request {
    user?: JwtPayload;
}
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
    create(createRecipeDto: CreateRecipeDto, res: Response): Promise<Response<any, Record<string, any>>>;
    findAll(req: RequestWithUser): Promise<({
        user: import("@prisma/client/runtime").GetResult<{
            id: string;
            email: string;
            passwordHash: string;
            isEmailVerified: boolean;
            verificationToken: string | null;
            verificationTokenExpires: Date | null;
            failedLoginAttempts: number;
            lockUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            createdAt: Date;
        }, unknown, never> & {};
        style: (import("@prisma/client/runtime").GetResult<{
            id: string;
            name: string;
            description: string | null;
            deletedAt: Date | null;
        }, unknown, never> & {}) | null;
        ingredients: (import("@prisma/client/runtime").GetResult<{
            recipeId: string;
            ingredientId: string;
            quantity: import("@prisma/client/runtime").Decimal;
            usageMoment: import(".prisma/client").UsageMoment | null;
            time: number | null;
            timeUnit: import(".prisma/client").TimeUnit | null;
            id: string;
        }, unknown, never> & {})[];
        brews: (import("@prisma/client/runtime").GetResult<{
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
        }, unknown, never> & {})[];
    } & import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        styleId: string | null;
        name: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        ibu: number | null;
        colorSrm: number | null;
        alcoholPercent: import("@prisma/client/runtime").Decimal | null;
        details: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {})[]>;
    findOne(id: string, req: RequestWithUser): Promise<{
        user: import("@prisma/client/runtime").GetResult<{
            id: string;
            email: string;
            passwordHash: string;
            isEmailVerified: boolean;
            verificationToken: string | null;
            verificationTokenExpires: Date | null;
            failedLoginAttempts: number;
            lockUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            createdAt: Date;
        }, unknown, never> & {};
        style: (import("@prisma/client/runtime").GetResult<{
            id: string;
            name: string;
            description: string | null;
            deletedAt: Date | null;
        }, unknown, never> & {}) | null;
        ingredients: (import("@prisma/client/runtime").GetResult<{
            recipeId: string;
            ingredientId: string;
            quantity: import("@prisma/client/runtime").Decimal;
            usageMoment: import(".prisma/client").UsageMoment | null;
            time: number | null;
            timeUnit: import(".prisma/client").TimeUnit | null;
            id: string;
        }, unknown, never> & {})[];
        brews: (import("@prisma/client/runtime").GetResult<{
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
        }, unknown, never> & {})[];
    } & import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        styleId: string | null;
        name: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        ibu: number | null;
        colorSrm: number | null;
        alcoholPercent: import("@prisma/client/runtime").Decimal | null;
        details: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}>;
    update(id: string, updateRecipeDto: UpdateRecipeDto, req: RequestWithUser, res: Response): Promise<Response<any, Record<string, any>>>;
    softDelete(id: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        userId: string;
        styleId: string | null;
        name: string;
        batchLiters: import("@prisma/client/runtime").Decimal;
        ibu: number | null;
        colorSrm: number | null;
        alcoholPercent: import("@prisma/client/runtime").Decimal | null;
        details: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}>;
}
export {};
