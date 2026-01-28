import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, Query, Patch } from '@nestjs/common';
import { BrewService } from './brew.service';
import { CreateBrewDto } from './dto/create-brew.dto';
import { UpdateBrewDto } from './dto/update-brew.dto';

@Controller('api/brews')
export class BrewController {
  constructor(private readonly brewService: BrewService) {}

  @Get()
  async findAll() {
    return await this.brewService.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() payload: CreateBrewDto) {
    return await this.brewService.create(payload);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() payload: UpdateBrewDto) {
    try {
      return await this.brewService.update(id, payload);
    } catch (error) {
      throw error;
    }
  }
  
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return await this.brewService.cancel(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.brewService.remove(id);
  }

  @Patch(':id')
  async patchBrew(
    @Param('id') id: string,
    @Body() body: { status?: string; bottlingDate?: string | Date }
  ) {
    // Validar que solo se puedan modificar status y/o bottlingDate
    const allowedFields = ['status', 'bottlingDate']
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
