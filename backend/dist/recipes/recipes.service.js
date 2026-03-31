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
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let RecipesService = class RecipesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRecipeDto) {
        var _a;
        const { styleId, ingredients } = createRecipeDto, rest = __rest(createRecipeDto, ["styleId", "ingredients"]);
        const data = Object.assign({}, rest);
        if (styleId) {
            data.style = { connect: { id: styleId } };
        }
        const exists = await this.prisma.recipe.findFirst({ where: { name: data.name, deletedAt: null } });
        if (exists)
            throw new common_1.ConflictException('Ya existe una receta con ese nombre');
        if (!ingredients || ingredients.length === 0) {
            return this.prisma.recipe.create({ data });
        }
        if (Array.isArray(ingredients)) {
            const seen = new Set();
            for (const ing of ingredients) {
                let key = `${ing.ingredientId}__${ing.usageMoment}`;
                if (ing.usageMoment === 'boil' || ing.usageMoment === 'hopstand' || ing.usageMoment === 'whirlpool' || ing.usageMoment === 'dry_hop') {
                    key = `${ing.ingredientId}__${ing.usageMoment}__${(_a = ing.time) !== null && _a !== void 0 ? _a : 'null'}`;
                }
                if (seen.has(key)) {
                    throw new common_1.BadRequestException('No puede haber ingredientes duplicados con el mismo ingrediente, momento y tiempo en la receta.');
                }
                seen.add(key);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.create({ data });
            const recipeIngredients = ingredients.map((ing) => {
                var _a, _b;
                return ({
                    recipeId: recipe.id,
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                    usageMoment: ing.usageMoment,
                    time: (_a = ing.time) !== null && _a !== void 0 ? _a : null,
                    timeUnit: (_b = ing.timeUnit) !== null && _b !== void 0 ? _b : null,
                });
            });
            await tx.recipeIngredient.createMany({ data: recipeIngredients });
            return recipe;
        });
    }
    async findAll(userId) {
        return this.prisma.recipe.findMany({
            where: { deletedAt: null, userId },
            include: { user: true, style: true, ingredients: true, brews: true },
        });
    }
    async findOne(id, userId) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null, userId },
            include: { user: true, style: true, ingredients: true, brews: true },
        });
        if (!recipe) {
            throw new common_1.NotFoundException('Recipe not found');
        }
        return recipe;
    }
    async update(id, updateRecipeDto) {
        var _a;
        const recipe = await this.prisma.recipe.findUnique({ where: { id } });
        if (!recipe || recipe.deletedAt) {
            throw new common_1.NotFoundException('Recipe not found');
        }
        const { ingredients, styleId } = updateRecipeDto, rest = __rest(updateRecipeDto, ["ingredients", "styleId"]);
        if (Array.isArray(ingredients)) {
            const seen = new Set();
            for (const ing of ingredients) {
                let key = `${ing.ingredientId}__${ing.usageMoment}`;
                if (ing.usageMoment === 'boil' || ing.usageMoment === 'hopstand' || ing.usageMoment === 'whirlpool' || ing.usageMoment === 'dry_hop') {
                    key = `${ing.ingredientId}__${ing.usageMoment}__${(_a = ing.time) !== null && _a !== void 0 ? _a : 'null'}`;
                }
                if (seen.has(key)) {
                    ;
                    throw new common_1.BadRequestException('No puede haber ingredientes duplicados con el mismo ingrediente, momento y tiempo en la receta.');
                }
                seen.add(key);
            }
        }
        const data = Object.assign({}, rest);
        if (updateRecipeDto.hasOwnProperty('styleId')) {
            if (styleId === null || styleId === undefined || styleId === '') {
                data.style = { disconnect: true };
            }
            else if (typeof styleId === 'string' && styleId.length > 0) {
                data.style = { connect: { id: styleId } };
            }
        }
        if (!ingredients) {
            return this.prisma.recipe.update({
                where: { id },
                data,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedRecipe = await tx.recipe.update({
                where: { id },
                data,
            });
            await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
            if (Array.isArray(ingredients) && ingredients.length > 0) {
                const recipeIngredients = ingredients.map((ing) => {
                    const base = {
                        recipeId: id,
                        ingredientId: ing.ingredientId,
                        quantity: ing.quantity,
                    };
                    if (ing.usageMoment !== undefined) {
                        base.usageMoment = ing.usageMoment;
                    }
                    if (ing.time !== undefined) {
                        base.time = ing.time;
                    }
                    if (ing.timeUnit !== undefined) {
                        base.timeUnit = ing.timeUnit;
                    }
                    return base;
                });
                await tx.recipeIngredient.createMany({ data: recipeIngredients });
            }
            const recetaFinal = await tx.recipe.findUnique({
                where: { id },
                include: { ingredients: true },
            });
            return updatedRecipe;
        });
    }
    async remove(id) {
        const recipe = await this.prisma.recipe.findUnique({ where: { id } });
        if (!recipe || recipe.deletedAt) {
            throw new common_1.NotFoundException('Recipe not found');
        }
        return this.softDelete(id);
    }
    async softDelete(id) {
        if (!id) {
            throw new common_1.BadRequestException('Id is required');
        }
        const allBrews = await this.prisma.brew.findMany();
        const activeBrews = await this.prisma.brew.findMany({
            where: {
                recipeId: id,
                deletedAt: null,
            },
        });
        if (activeBrews.length > 0) {
            throw new common_1.ConflictException('No se puede eliminar la receta porque está asociada a una o más cocciones activas.');
        }
        try {
            return await this.prisma.recipe.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Recipe to delete not found');
            }
            throw error;
        }
    }
};
RecipesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipesService);
exports.RecipesService = RecipesService;
//# sourceMappingURL=recipes.service.js.map