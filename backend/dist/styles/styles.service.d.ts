import { PrismaService } from '../prisma.service';
export declare class StylesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {})[]>;
    create(payload: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
    update(id: string, payload: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
    softDelete(id: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
        userId: string;
    }, unknown, never> & {}>;
}
