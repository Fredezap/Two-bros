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
    create(dto) {
        return this.ingredientsService.create(dto);
    }
    async update(id, dto) {
        return this.ingredientsService.update(id, dto);
    }
    async softDelete(id) {
        return this.ingredientsService.softDelete(id);
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
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ingredient_dto_1.CreateIngredientDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ingredient_dto_1.UpdateIngredientDto]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "softDelete", null);
IngredientsController = __decorate([
    (0, common_1.Controller)('api/ingredients'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
exports.IngredientsController = IngredientsController;
//# sourceMappingURL=ingredients.controller.js.map