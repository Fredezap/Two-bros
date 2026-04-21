import { ConflictException, Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.ingredient.findMany({
      where: { deletedAt: null, userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateIngredientDto) {
    // Validar nombre único (no borrado, por usuario)
    const exists = await this.prisma.ingredient.findFirst({ where: { name: dto.name, deletedAt: null, userId: dto.userId } });
    if (exists) throw new ConflictException('Ya existe un ingrediente con ese nombre para este usuario');
    try {
      const { userId, ...rest } = dto;
      const ingredient = await this.prisma.ingredient.create({
        data: {
          ...rest,
          user: { connect: { id: userId } },
        },
      });
      return ingredient;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ingredient with this data already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: any, userId: string) {
    // Validar existencia y propiedad
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id }, include: { recipeIngredients: true } });
    if (!ingredient || ingredient.deletedAt) throw new Error('Ingrediente no encontrado');
    if (ingredient.userId !== userId) throw new Error('No autorizado para modificar este ingrediente');

    // Si está relacionado a recetas activas, bloquear cambios en name, type o unitOfMeasure
    if (ingredient.recipeIngredients && ingredient.recipeIngredients.length > 0) {
      const activeLinks = await this.prisma.recipeIngredient.findMany({
        where: {
          ingredientId: id,
          recipe: { deletedAt: null },
        },
      });
      if (activeLinks.length > 0) {
        // Si se intenta modificar name, type o unitOfMeasure, lanzar error
        if ((dto.name && dto.name !== ingredient.name) ||
            (dto.type && dto.type !== ingredient.type) ||
            (dto.unitOfMeasure && dto.unitOfMeasure !== ingredient.unitOfMeasure)) {
          throw new ConflictException('No se puede modificar el nombre, tipo o unidad de medida porque el ingrediente está relacionado a una o más recetas activas.');
        }
        // Solo permitir modificar stock, reorderThreshold e isInStock, descartar el resto
        const allowedFields = ['stock', 'reorderThreshold', 'isInStock'];
        const filteredDto: any = {};
        for (const k of allowedFields) {
          if (dto.hasOwnProperty(k)) filteredDto[k] = dto[k];
        }
        // Si no hay cambios válidos, lanzar error
        if (Object.keys(filteredDto).length === 0) {
          throw new ConflictException('Solo se puede modificar el stock, el umbral de alerta o la visibilidad en stock porque el ingrediente está relacionado a una o más recetas activas.');
        }
        dto = filteredDto;
      }
    }

    // Si cambia el nombre, validar que no exista otro igual (no borrado, por usuario)
    if (dto.name && dto.name !== ingredient.name) {
      const exists = await this.prisma.ingredient.findFirst({ where: { name: dto.name, deletedAt: null, NOT: { id }, userId: ingredient.userId } });
      if (exists) throw new ConflictException('Ya existe un ingrediente con ese nombre para este usuario');
    }

    try {
      return await this.prisma.ingredient.update({ where: { id }, data: dto });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ingredient with this data already exists');
      }
      throw error;
    }
  }

  // Método para sumar stock de forma segura
  async addStock(id: string, amount: number, userId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient || ingredient.deletedAt) throw new Error('Ingrediente no encontrado');
    if (ingredient.userId !== userId) throw new Error('No autorizado para modificar este ingrediente');
    return this.prisma.ingredient.update({
      where: { id },
      data: { stock: { increment: amount }, isInStock: true },
    });
  }
  async softDelete(id: string, userId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: { recipeIngredients: true },
    });
    if (!ingredient || ingredient.deletedAt) throw new Error('Ingrediente no encontrado');
    if (ingredient.userId !== userId) throw new Error('No autorizado para eliminar este ingrediente');

    // Verificar si está relacionado a alguna receta NO eliminada
    if (ingredient.recipeIngredients && ingredient.recipeIngredients.length > 0) {
      // Buscar si alguna receta relacionada no está eliminada
      const activeLinks = await this.prisma.recipeIngredient.findMany({
        where: {
          ingredientId: id,
          recipe: { deletedAt: null },
        },
      });
      if (activeLinks.length > 0) {
        throw new ConflictException('No se puede eliminar el ingrediente porque está relacionado a una o más recetas activas.');
      }
    }

    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      throw error;
    }
  }
}