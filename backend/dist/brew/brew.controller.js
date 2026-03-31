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
exports.BrewController = void 0;
const common_1 = require("@nestjs/common");
const parse_uuid_pipe_1 = require("../pipes/parse-uuid.pipe");
const brew_service_1 = require("./brew.service");
const jwt_auth_guard_1 = require("../users/jwt-auth.guard");
const create_brew_dto_1 = require("./dto/create-brew.dto");
const update_brew_dto_1 = require("./dto/update-brew.dto");
let BrewController = class BrewController {
    constructor(brewService) {
        this.brewService = brewService;
    }
    async findAll(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('No autorizado');
        return await this.brewService.findAll(userId);
    }
    async create(payload) {
        return await this.brewService.create(payload);
    }
    async update(id, payload) {
        try {
            return await this.brewService.update(id, payload);
        }
        catch (error) {
            throw error;
        }
    }
    async cancel(id) {
        return await this.brewService.cancel(id);
    }
    async remove(id) {
        return await this.brewService.remove(id);
    }
    async patchBrew(id, body) {
        const allowedFields = ['status', 'bottlingDate', 'notes'];
        const keys = Object.keys(body);
        if (keys.length === 0) {
            return { message: 'No data to update' };
        }
        for (const k of keys) {
            if (!allowedFields.includes(k)) {
                return { error: `Field '${k}' is not allowed to be updated via PATCH` };
            }
        }
        return await this.brewService.patchBrew(id, body);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brew_dto_1.CreateBrewDto]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brew_dto_1.UpdateBrewDto]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', new parse_uuid_pipe_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrewController.prototype, "patchBrew", null);
BrewController = __decorate([
    (0, common_1.Controller)('api/brews'),
    __metadata("design:paramtypes", [brew_service_1.BrewService])
], BrewController);
exports.BrewController = BrewController;
//# sourceMappingURL=brew.controller.js.map