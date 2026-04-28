/// <reference types="cookie-parser" />
import { Request } from 'express';
type JwtPayload = {
    sub: string;
    email: string;
};
interface RequestWithUser extends Request {
    user?: JwtPayload;
}
import { UpdateStyleDto } from './dto/update-style.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { StylesService } from './styles.service';
export declare class StylesController {
    private readonly stylesService;
    constructor(stylesService: StylesService);
    findAll(req: RequestWithUser): Promise<(import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
    }, unknown, never> & {})[]>;
    create(payload: CreateStyleDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
    }, unknown, never> & {}>;
    update(id: string, payload: UpdateStyleDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
    }, unknown, never> & {}>;
    remove(id: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        name: string;
        description: string | null;
        deletedAt: Date | null;
    }, unknown, never> & {}>;
}
export {};
