/// <reference types="cookie-parser" />
import { Response } from 'express';
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
        userId: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
    }, unknown, never> & {})[]>;
    create(dto: CreateIngredientDto, res: Response): Promise<Response<any, Record<string, any>>>;
    update(id: string, dto: UpdateIngredientDto, req: RequestWithUser, res: Response): Promise<Response<any, Record<string, any>>>;
    softDelete(id: string, req: RequestWithUser, res: Response): Promise<Response<any, Record<string, any>>>;
}
export {};
