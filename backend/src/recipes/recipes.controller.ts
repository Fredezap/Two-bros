import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put, Res, UseGuards, Req, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { Response, Request } from 'express';
type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { UserIdInjectInterceptor } from './userid-inject.interceptor';

@Controller('recipes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIdInjectInterceptor)
  async create(@Body() createRecipeDto: CreateRecipeDto, @Res() res: Response) {
    try {
      const result = await this.recipesService.create(createRecipeDto);
      return res.status(201).json(result);
    } catch (error: any) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('No autorizado');
    return this.recipesService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('No autorizado');
    return this.recipesService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new UnauthorizedException('No autorizado');
      // Pasar userId al service
      const result = await this.recipesService.update(id, { ...updateRecipeDto, userId });
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.getStatus && error.getResponse) {
        return res.status(error.getStatus()).json({ message: error.getResponse().message || error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  @Delete(':id')
  softDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.softDelete(id);
  }
}
