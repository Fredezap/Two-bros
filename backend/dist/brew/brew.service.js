"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BrewService = class BrewService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const brews = await this.prisma.brew.findMany({
            orderBy: { brewDate: 'desc' },
            where: { deletedAt: null, userId },
            include: {
                recipe: {
                    include: {
                        ingredients: {
                            include: { ingredient: true }
                        },
                        style: true,
                    }
                }
            }
        });
        return brews.map(brew => {
            var _a;
            return (Object.assign(Object.assign({}, brew), { recipe: brew.recipe ? Object.assign(Object.assign({}, brew.recipe), { details: (_a = brew.recipe.details) !== null && _a !== void 0 ? _a : {} }) : null }));
        });
    }
    async create(payload) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { id: payload.recipeId },
            include: { ingredients: { include: { ingredient: true } } },
        });
        if (!recipe)
            throw new common_1.NotFoundException('Receta no encontrada');
        const faltantes = [];
        for (const ri of recipe.ingredients) {
            const stockActual = Number(ri.ingredient.stock);
            const cantidadNecesaria = Number(ri.quantity);
            if (!payload.force && stockActual < cantidadNecesaria) {
                faltantes.push({
                    ingredientId: ri.ingredientId,
                    name: ri.ingredient.name,
                    requerido: cantidadNecesaria,
                    disponible: stockActual,
                });
            }
        }
        if (faltantes.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Stock insuficiente para uno o más ingredientes',
                faltantes,
            });
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                for (const ri of recipe.ingredients) {
                    const cantidadNecesaria = Number(ri.quantity);
                    await tx.ingredient.update({
                        where: { id: ri.ingredientId },
                        data: { stock: { decrement: cantidadNecesaria } },
                    });
                }
                const { force } = payload, brewPayload = __rest(payload, ["force"]);
                const brew = await tx.brew.create({ data: brewPayload });
                return brew;
            });
            return result;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Brew with this data already exists');
            }
            throw error;
        }
    }
    async update(id, payload) {
        try {
            return await this.prisma.brew.update({
                where: { id },
                data: payload,
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Brew to update not found');
            }
            throw error;
        }
    }
    async cancel(id) {
        const brew = await this.prisma.brew.findUnique({
            where: { id },
            include: { recipe: { include: { ingredients: true } } }
        });
        if (!brew)
            throw new common_1.NotFoundException('Brew not found');
        if (brew.status !== 'in_progress')
            throw new common_1.BadRequestException('Solo se pueden cancelar cocciones en progreso');
        try {
            await this.prisma.$transaction(async (tx) => {
                for (const ri of brew.recipe.ingredients) {
                    await tx.ingredient.update({
                        where: { id: ri.ingredientId },
                        data: { stock: { increment: Number(ri.quantity) } }
                    });
                }
                await tx.brew.update({
                    where: { id },
                    data: { status: 'cancelled' }
                });
            });
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al cancelar la cocción: ' + ((error === null || error === void 0 ? void 0 : error.message) || error));
        }
    }
    async remove(id) {
        try {
            await this.prisma.brew.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al eliminar la cocción: ' + ((error === null || error === void 0 ? void 0 : error.message) || error));
        }
    }
    async patchBrew(id, data) {
        try {
            const patchData = {};
            if (data.status !== undefined)
                patchData.status = data.status;
            if (data.bottlingDate !== undefined)
                patchData.bottlingDate = data.bottlingDate ? new Date(data.bottlingDate) : null;
            if (data.notes !== undefined)
                patchData.notes = data.notes;
            return await this.prisma.brew.update({
                where: { id },
                data: patchData,
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Brew to patch not found');
            }
            throw error;
        }
    }
};
BrewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrewService);
exports.BrewService = BrewService;
//# sourceMappingURL=brew.service.js.map