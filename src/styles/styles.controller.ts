import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { Request } from 'express';
type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}
import { UpdateStyleDto } from './dto/update-style.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { StylesService } from './styles.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@Controller('api/styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('No autorizado');
    return await this.stylesService.findAll(userId);
  }

  @Post()
  async create(@Body() payload: CreateStyleDto) {
    return await this.stylesService.create(payload);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() payload: UpdateStyleDto) {
    try {
      return await this.stylesService.update(id, payload);
    } catch (error) {
      throw error;
    }
  }
  
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.stylesService.softDelete(id);
  }
}
