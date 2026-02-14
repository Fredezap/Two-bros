import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Controller('api/recipes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto, @Res() res: Response) {
    try {
      const result = await this.recipesService.create(createRecipeDto);
      return res.status(201).json(result);
    } catch (error) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateRecipeDto: any, @Res() res: Response) {
    try {
      const result = await this.recipesService.update(id, updateRecipeDto);
      return res.status(200).json(result);
    } catch (error) {
      if (error.getStatus && error.getResponse) {
        // Es una excepción de Nest (como BadRequestException)
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      // Otro error
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  @Delete(':id')
  softDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.softDelete(id);
  }
}
