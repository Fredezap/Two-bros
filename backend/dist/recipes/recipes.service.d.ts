import { PrismaService } from '../prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
export declare class RecipesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createRecipeDto: CreateRecipeDto): Promise<import("@prisma/client/runtime").GetResult<{
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
    findAll(userId: string): Promise<({
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
            userId: string;
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
    findOne(id: string, userId: string): Promise<{
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
            userId: string;
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
    update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<import("@prisma/client/runtime").GetResult<{
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
    remove(id: string): Promise<import("@prisma/client/runtime").GetResult<{
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
