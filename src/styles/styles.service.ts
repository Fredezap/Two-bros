import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StylesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.style.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async create(payload: any) {
    try {
      const style = await this.prisma.style.create({ data: payload });
      return style;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        // Prisma unique constraint failed
        throw new ConflictException('Style with this name already exists');
      }
      throw error;
    }
  }
  
  async update(id: string, payload: any) {
      try {
        return await this.prisma.style.update({
          where: { id },
          data: payload,
        });
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          throw new ConflictException('Style with this name already exists');
        }
        throw error;
      }
  }

  async softDelete(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    // Verificar si hay recetas activas asociadas a este estilo
    const activeRecipes = await this.prisma.recipe.findMany({
      where: {
        styleId: id,
        deletedAt: null,
      },
    });
    if (activeRecipes.length > 0) {
      throw new ConflictException('No se puede eliminar el estilo porque está asociado a una o más recetas activas.');
    }

    try {
      return await this.prisma.style.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Style to delete not found');
      }
      throw error;
    }
  }
}
