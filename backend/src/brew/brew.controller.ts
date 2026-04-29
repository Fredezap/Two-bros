import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, Query, Patch, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ParseUUIDPipe } from '../pipes/parse-uuid.pipe';
import { Request } from 'express';
type JwtPayload = { sub: string; email: string };
interface RequestWithUser extends Request {
  user?: JwtPayload;
}
import { BrewService } from './brew.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { CreateBrewDto } from './dto/create-brew.dto';
import { UpdateBrewDto } from './dto/update-brew.dto';
import type { BrewPatchDto } from './brew.service';

@Controller('brews')
export class BrewController {
  constructor(private readonly brewService: BrewService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('No autorizado');
    return await this.brewService.findAll(userId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() payload: CreateBrewDto) {
    return await this.brewService.create(payload);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() payload: UpdateBrewDto) {
    try {
      return await this.brewService.update(id, payload);
    } catch (error) {
      throw error;
    }
  }
  
  @Post(':id/cancel')
  async cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.brewService.cancel(id);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.brewService.remove(id);
  }

  @Patch(':id')
  async patchBrew(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: BrewPatchDto
  ) {
    // Validar que solo se puedan modificar status, bottlingDate y notes
    const allowedFields = ['status', 'bottlingDate', 'notes']
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return { message: 'No data to update' }
    }
    for (const k of keys) {
      if (!allowedFields.includes(k)) {
        return { error: `Field '${k}' is not allowed to be updated via PATCH` }
      }
    }
    return await this.brewService.patchBrew(id, body)
  }
}
