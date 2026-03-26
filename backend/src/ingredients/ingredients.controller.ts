
import { Controller, Get, Post, Body, UsePipes, ValidationPipe, Put, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { Request } from 'express';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Controller('api/ingredients')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('No autorizado');
    return this.ingredientsService.findAll(userId);
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
