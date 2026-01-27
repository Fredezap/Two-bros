import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('api/recipes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }
// todo: aunque elimine todos los validadores del updateRecipeDto, sigue sin entrar en update, no se que esta pasando 
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateRecipeDto: any) {
      try {
        return await this.recipesService.update(id, updateRecipeDto);
      } catch (error) {
        throw error;
      }
    }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.recipesService.softDelete(id);
  }
}
