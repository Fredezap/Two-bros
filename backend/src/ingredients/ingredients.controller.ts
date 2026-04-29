
import { Controller, Get, Post, Body, UsePipes, ValidationPipe, Put, Param, Delete, UseGuards, Req, UnauthorizedException, UseInterceptors, Res } from '@nestjs/common';
import { Response } from 'express';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { Request } from 'express';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { UserIdInjectInterceptor } from '../recipes/userid-inject.interceptor';

type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Controller('ingredients')
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIdInjectInterceptor)
  async create(@Body() dto: CreateIngredientDto, @Res() res: Response) {
    try {
      const result = await this.ingredientsService.create(dto);
      return res.status(201).json(result);
    } catch (error: any) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIdInjectInterceptor)
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateIngredientDto, @Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) return res.status(401).json({ message: 'No autorizado' });
      const result = await this.ingredientsService.update(id, dto, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async softDelete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: RequestWithUser, @Res() res: Response) {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'No autorizado' });
    try {
      const result = await this.ingredientsService.softDelete(id, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}
