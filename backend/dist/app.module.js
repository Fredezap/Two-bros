"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const logger_middleware_1 = require("./logger.middleware");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const ingredients_service_1 = require("./ingredients/ingredients.service");
const ingredients_controller_1 = require("./ingredients/ingredients.controller");
const styles_service_1 = require("./styles/styles.service");
const styles_controller_1 = require("./styles/styles.controller");
const recipes_controller_1 = require("./recipes/recipes.controller");
const recipes_service_1 = require("./recipes/recipes.service");
const brew_controller_1 = require("./brew/brew.controller");
const brew_service_1 = require("./brew/brew.service");
const users_controller_1 = require("./users/users.controller");
const users_service_1 = require("./users/users.service");
const email_service_1 = require("./users/email.service");
const jwt_service_1 = require("./users/jwt.service");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController, ingredients_controller_1.IngredientsController, styles_controller_1.StylesController, recipes_controller_1.RecipesController, brew_controller_1.BrewController, users_controller_1.UsersController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService, ingredients_service_1.IngredientsService, styles_service_1.StylesService, recipes_service_1.RecipesService, brew_service_1.BrewService, users_service_1.UsersService, email_service_1.EmailService, jwt_service_1.JwtService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map