/// <reference types="cookie-parser" />
import { Request } from 'express';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';
type JwtPayload = {
    sub: string;
    email: string;
};
interface RequestWithUser extends Request {
    user?: JwtPayload;
}
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    findAll(req: RequestWithUser): Promise<(import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {})[]>;
    create(dto: CreateIngredientDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
    update(id: string, dto: UpdateIngredientDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
    softDelete(id: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
}
export {};
