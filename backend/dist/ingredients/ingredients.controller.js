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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsController = void 0;
const common_1 = require("@nestjs/common");
const parse_uuid_pipe_1 = require("../pipes/parse-uuid.pipe");
const create_ingredient_dto_1 = require("./dto/create-ingredient.dto");
const update_ingredient_dto_1 = require("./dto/update-ingredient.dto");
const ingredients_service_1 = require("./ingredients.service");
const jwt_auth_guard_1 = require("../users/jwt-auth.guard");
const userid_inject_interceptor_1 = require("../recipes/userid-inject.interceptor");
let IngredientsController = class IngredientsController {
    constructor(ingredientsService) {
        this.ingredientsService = ingredientsService;
    }
    findAll(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('No autorizado');
        return this.ingredientsService.findAll(userId);
    }
    async create(dto, res) {
        try {
            const result = await this.ingredientsService.create(dto);
            return res.status(201).json(result);
        }
        catch (error) {
            if (error.getStatus && error.getResponse) {
                return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
            }
            return res.status(500).json({ message: error.message || 'Internal server error' });
        }
    }
    async update(id, dto, req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
            if (!userId)
                return res.status(401).json({ message: 'No autorizado' });
            const result = await this.ingredientsService.update(id, dto, userId);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.getStatus && error.getResponse) {
                return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
            }
            return res.status(500).json({ message: error.message || 'Internal server error' });
        }
    }
    async softDelete(id, req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            return res.status(401).json({ message: 'No autorizado' });
        try {
            const result = await this.ingredientsService.softDelete(id, userId);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.getStatus && error.getResponse) {
                return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
            }
            return res.status(500).json({ message: error.message || 'Internal server error' });
        }
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(userid_inject_interceptor_1.UserIdInjectInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ingredient_dto_1.CreateIngredientDto, Object]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(userid_inject_interceptor_1.UserIdInjectInterceptor),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ingredient_dto_1.UpdateIngredientDto, Object, Object]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "softDelete", null);
IngredientsController = __decorate([
    (0, common_1.Controller)('api/ingredients'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
exports.IngredientsController = IngredientsController;
//# sourceMappingURL=ingredients.controller.js.map