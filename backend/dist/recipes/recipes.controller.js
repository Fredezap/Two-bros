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
exports.RecipesController = void 0;
const common_1 = require("@nestjs/common");
const parse_uuid_pipe_1 = require("../pipes/parse-uuid.pipe");
const recipes_service_1 = require("./recipes.service");
const jwt_auth_guard_1 = require("../users/jwt-auth.guard");
const create_recipe_dto_1 = require("./dto/create-recipe.dto");
const update_recipe_dto_1 = require("./dto/update-recipe.dto");
const userid_inject_interceptor_1 = require("./userid-inject.interceptor");
let RecipesController = class RecipesController {
    constructor(recipesService) {
        this.recipesService = recipesService;
    }
    async create(createRecipeDto, res) {
        try {
            const result = await this.recipesService.create(createRecipeDto);
            return res.status(201).json(result);
        }
        catch (error) {
            if (error.getStatus && error.getResponse) {
                return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
            }
            return res.status(500).json({ message: error.message || 'Internal server error' });
        }
    }
    findAll(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('No autorizado');
        return this.recipesService.findAll(userId);
    }
    findOne(id, req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('No autorizado');
        return this.recipesService.findOne(id, userId);
    }
    async update(id, updateRecipeDto, req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
            if (!userId)
                throw new common_1.UnauthorizedException('No autorizado');
            const result = await this.recipesService.update(id, Object.assign(Object.assign({}, updateRecipeDto), { userId }));
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.getStatus && error.getResponse) {
                return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
            }
            return res.status(500).json({ message: error.message || 'Internal server error' });
        }
    }
    softDelete(id) {
        return this.recipesService.softDelete(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(userid_inject_interceptor_1.UserIdInjectInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recipe_dto_1.CreateRecipeDto, Object]),
    __metadata("design:returntype", Promise)
], RecipesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecipesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecipesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recipe_dto_1.UpdateRecipeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], RecipesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecipesController.prototype, "softDelete", null);
RecipesController = __decorate([
    (0, common_1.Controller)('api/recipes'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [recipes_service_1.RecipesService])
], RecipesController);
exports.RecipesController = RecipesController;
//# sourceMappingURL=recipes.controller.js.map