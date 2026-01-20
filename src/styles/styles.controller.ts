import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateStyleDto } from './dto/update-style.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { StylesService } from './styles.service';

@Controller('api/styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Get()
  async findAll() {
    return await this.stylesService.findAll();
  }

  @Post()
  async create(@Body() payload: CreateStyleDto) {
    return await this.stylesService.create(payload);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() payload: UpdateStyleDto) {
    try {
      const a = await this.stylesService.update(id, payload);
      console.log("Update result:", a);
      return a;
    } catch (error) {
      console.error("Error in controller update:", error);
      throw error;
    }
  }
// todo: a futuro, cuando ya pueda agregar cocciones, fijarme que no me deje eliminar recetas que tengan cocciones
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const a =  await this.stylesService.softDelete(id);
  console.log("Soft delete result:", a);
    return a
  }
}
