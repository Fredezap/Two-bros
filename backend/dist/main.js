"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4300;
    await app.listen(port);
    console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map