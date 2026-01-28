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

@Module({
  imports: [],
  controllers: [AppController, IngredientsController, StylesController, RecipesController, BrewController],
  providers: [AppService, PrismaService, IngredientsService, StylesService, RecipesService, BrewService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
