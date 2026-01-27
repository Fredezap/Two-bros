import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
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
}
