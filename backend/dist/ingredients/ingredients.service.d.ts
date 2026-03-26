import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PrismaService } from '../prisma.service';
export declare class IngredientsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
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
    }, unknown, never> & {}>;
    update(id: string, dto: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        type: string;
        unitOfMeasure: string;
        stock: import("@prisma/client/runtime").Decimal;
        reorderThreshold: import("@prisma/client/runtime").Decimal;
        isInStock: boolean;
        version: number;
        deletedAt: Date | null;
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
    }, unknown, never> & {}>;
}
