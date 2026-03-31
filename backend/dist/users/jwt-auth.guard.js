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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("./jwt.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        let token = null;
        const auth = req.headers['authorization'];
        if (auth && auth.startsWith('Bearer ')) {
            token = auth.replace('Bearer ', '');
        }
        else if (req.cookies && req.cookies['access_token']) {
            token = req.cookies['access_token'];
        }
        if (!token)
            throw new common_1.UnauthorizedException('Token requerido');
        try {
            const payload = this.jwtService.verify(token);
            req.user = payload;
            return true;
        }
        catch (_a) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
};
JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_service_1.JwtService])
], JwtAuthGuard);
exports.JwtAuthGuard = JwtAuthGuard;
//# sourceMappingURL=jwt-auth.guard.js.map