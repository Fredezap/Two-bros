import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBrewDto } from './dto/create-brew.dto';
import { UpdateBrewDto } from './dto/update-brew.dto';

@Injectable()
export class BrewService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brew.findMany({
      orderBy: { brewDate: 'desc' },
      where: { deletedAt: null },
    });
  }

  async create(payload: CreateBrewDto) {
    try {
      const brew = await this.prisma.brew.create({ data: payload });
      return brew;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Brew with this data already exists');
      }
      throw error;
    }
  }

  async update(id: string, payload: UpdateBrewDto) {
    try {
      return await this.prisma.brew.update({
        where: { id },
        data: payload,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Brew to update not found');
      }
      throw error;
    }
  }

  async cancel(id: string) {
    // 1. Buscar la brew y la receta asociada con ingredientes
    const brew = await this.prisma.brew.findUnique({
      where: { id },
      include: { recipe: { include: { ingredients: true } } }
    });
    if (!brew) throw new NotFoundException('Brew not found');
    if (brew.status !== 'in_progress') throw new BadRequestException('Solo se pueden cancelar cocciones en progreso');

    // 2. Ejecutar todo en una transacción protegida
    try {
      await this.prisma.$transaction(async (tx) => {
        // Reponer stock de ingredientes
        for (const ri of brew.recipe.ingredients) {
          await tx.ingredient.update({
            where: { id: ri.ingredientId },
            data: { stock: { increment: Number(ri.quantity) } }
          });
        }
        // Marcar la brew como cancelada
        await tx.brew.update({
          where: { id },
          data: { status: 'cancelled' }
        });
      });
      return { success: true };
    } catch (error) {
      throw new BadRequestException('Error al cancelar la cocción: ' + (error?.message || error));
    }
  }
  
    async remove(id: string) {
    // Soft delete: marcar la cocción como eliminada
    try {
      await this.prisma.brew.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return { success: true };
    } catch (error) {
      throw new BadRequestException('Error al eliminar la cocción: ' + (error?.message || error));
    }
  }

    async patchBrew(id: string, data: { status?: string; bottlingDate?: string | Date }) {
    try {
      // Solo permitir status y/o bottlingDate
      const patchData: any = {}
      if (data.status !== undefined) patchData.status = data.status
      if (data.bottlingDate !== undefined) patchData.bottlingDate = data.bottlingDate ? new Date(data.bottlingDate) : null
      return await this.prisma.brew.update({
        where: { id },
        data: patchData,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Brew to patch not found')
      }
      throw error
    }
  }
}
