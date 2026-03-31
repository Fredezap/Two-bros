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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let IngredientsService = class IngredientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.ingredient.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async create(dto) {
        const exists = await this.prisma.ingredient.findFirst({ where: { name: dto.name, deletedAt: null } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un ingrediente con ese nombre');
        try {
            const ingredient = await this.prisma.ingredient.create({ data: dto });
            return ingredient;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Ingredient with this data already exists');
            }
            throw error;
        }
    }
    async update(id, dto) {
        const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
        if (!ingredient || ingredient.deletedAt)
            throw new Error('Ingrediente no encontrado');
        if (dto.name && dto.name !== ingredient.name) {
            const exists = await this.prisma.ingredient.findFirst({ where: { name: dto.name, deletedAt: null, NOT: { id } } });
            if (exists)
                throw new common_1.ConflictException('Ya existe un ingrediente con ese nombre');
        }
        try {
            return await this.prisma.ingredient.update({ where: { id }, data: dto });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Ingredient with this data already exists');
            }
            throw error;
        }
    }
    async softDelete(id) {
        const ingredient = await this.prisma.ingredient.findUnique({
            where: { id },
            include: { recipeIngredients: true },
        });
        if (!ingredient || ingredient.deletedAt)
            throw new Error('Ingrediente no encontrado');
        if (ingredient.recipeIngredients && ingredient.recipeIngredients.length > 0) {
            const activeLinks = await this.prisma.recipeIngredient.findMany({
                where: {
                    ingredientId: id,
                    recipe: { deletedAt: null },
                },
            });
            if (activeLinks.length > 0) {
                throw new common_1.ConflictException('No se puede eliminar el ingrediente porque está relacionado a una o más recetas activas.');
            }
        }
        try {
            return await this.prisma.ingredient.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
};
IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IngredientsService);
exports.IngredientsService = IngredientsService;
//# sourceMappingURL=ingredients.service.js.map