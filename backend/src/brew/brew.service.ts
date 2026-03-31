import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBrewDto } from './dto/create-brew.dto';
import { UpdateBrewDto } from './dto/update-brew.dto';

export type BrewPatchDto = { status?: string; bottlingDate?: string | Date; notes?: string }

@Injectable()
export class BrewService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const brews = await this.prisma.brew.findMany({
      orderBy: { brewDate: 'desc' },
      where: { deletedAt: null, userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: { ingredient: true }
            },
            style: true,
          }
        }
      }
    });
    // Normalizar details
    return brews.map(brew => ({
      ...brew,
      recipe: brew.recipe ? {
        ...brew.recipe,
        details: brew.recipe.details ?? {},
      } : null
    }));
  }

  /**
   * Crea una cocción, validando y descontando stock de ingredientes.
   * Si force=true, permite stock negativo.
   * @param payload CreateBrewDto & { force?: boolean }
   */
  async create(payload: CreateBrewDto & { force?: boolean }) {
    // 1. Buscar la receta y sus ingredientes
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: payload.recipeId },
      include: { ingredients: { include: { ingredient: true } } },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');

    // 2. Calcular cantidades necesarias (ajustar por batchLiters si corresponde)
    // Por ahora, asumimos que la cantidad en recipe.ingredients ya está ajustada

    // 3. Verificar stock suficiente (si no es force)
    const faltantes = [];
    for (const ri of recipe.ingredients) {
      const stockActual = Number(ri.ingredient.stock);
      const cantidadNecesaria = Number(ri.quantity);
      if (!payload.force && stockActual < cantidadNecesaria) {
        faltantes.push({
          ingredientId: ri.ingredientId,
          name: ri.ingredient.name,
          requerido: cantidadNecesaria,
          disponible: stockActual,
        });
      }
    }
    if (faltantes.length > 0) {
      throw new BadRequestException({
        message: 'Stock insuficiente para uno o más ingredientes',
        faltantes,
      });
    }

    // 4. Ejecutar todo en una transacción
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Descontar stock de ingredientes
        for (const ri of recipe.ingredients) {
          const cantidadNecesaria = Number(ri.quantity);
          await tx.ingredient.update({
            where: { id: ri.ingredientId },
            data: { stock: { decrement: cantidadNecesaria } },
          });
        }
        // Eliminar force del payload antes de crear la brew
        const { force, ...brewPayload } = payload;
        const brew = await tx.brew.create({ data: brewPayload });
        return brew;
      });
      return result;
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
    } catch (error: any) {
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
    } catch (error: any) {
      throw new BadRequestException('Error al eliminar la cocción: ' + (error?.message || error));
    }
  }

    async patchBrew(id: string, data: BrewPatchDto) {
    try {
      // Permitir status, bottlingDate y notes
      const patchData: any = {}
      if (data.status !== undefined) patchData.status = data.status
      if (data.bottlingDate !== undefined) patchData.bottlingDate = data.bottlingDate ? new Date(data.bottlingDate) : null
      if (data.notes !== undefined) patchData.notes = data.notes
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
