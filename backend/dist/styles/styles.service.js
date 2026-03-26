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
exports.StylesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let StylesService = class StylesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.style.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async create(payload) {
        var _a, _b;
        try {
            const style = await this.prisma.style.create({ data: payload });
            return style;
        }
        catch (error) {
            if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('name'))) {
                throw new common_1.ConflictException('Style with this name already exists');
            }
            throw error;
        }
    }
    async update(id, payload) {
        var _a, _b;
        try {
            return await this.prisma.style.update({
                where: { id },
                data: payload,
            });
        }
        catch (error) {
            if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('name'))) {
                throw new common_1.ConflictException('Style with this name already exists');
            }
            throw error;
        }
    }
    async softDelete(id) {
        if (!id) {
            throw new common_1.BadRequestException('Id is required');
        }
        const activeRecipes = await this.prisma.recipe.findMany({
            where: {
                styleId: id,
                deletedAt: null,
            },
        });
        if (activeRecipes.length > 0) {
            throw new common_1.ConflictException('No se puede eliminar el estilo porque está asociado a una o más recetas activas.');
        }
        try {
            return await this.prisma.style.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Style to delete not found');
            }
            throw error;
        }
    }
};
StylesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StylesService);
exports.StylesService = StylesService;
//# sourceMappingURL=styles.service.js.map