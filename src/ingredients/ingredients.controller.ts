
import { Controller, Get, Post, Body, UsePipes, ValidationPipe, Put, Param, Delete } from '@nestjs/common';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';


@Controller('api/ingredients')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(id, dto);
  }
  @Delete(':id')
  async softDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ingredientsService.softDelete(id);
  }
}
