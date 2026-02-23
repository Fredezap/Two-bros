import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { IngredientsService } from './ingredients/ingredients.service';
import { IngredientsController } from './ingredients/ingredients.controller';
import { StylesService } from './styles/styles.service';
import { StylesController } from './styles/styles.controller';
import { RecipesController } from './recipes/recipes.controller';
import { RecipesService } from './recipes/recipes.service';
import { BrewController } from './brew/brew.controller';
import { BrewService } from './brew/brew.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { EmailService } from './users/email.service';
import { JwtService } from './users/jwt.service';

@Module({
  imports: [],
  controllers: [AppController, IngredientsController, StylesController, RecipesController, BrewController, UsersController],
  providers: [AppService, PrismaService, IngredientsService, StylesService, RecipesService, BrewService, UsersService, EmailService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
