import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

async create(createRecipeDto: CreateRecipeDto) {
    // Separar ingredients del resto
    const { styleId, ingredients, ...rest } = createRecipeDto;
    const data: any = { ...rest };
    if (styleId) {
      data.style = { connect: { id: styleId } };
    }

    // Validar nombre único (no borrado)
    const exists = await this.prisma.recipe.findFirst({ where: { name: data.name, deletedAt: null } });
    if (exists) throw new ConflictException('Ya existe una receta con ese nombre');

    // Si no hay ingredientes, solo crear la receta
    if (!ingredients || ingredients.length === 0) {
      return this.prisma.recipe.create({ data });
    }

    // Validar duplicados (ingredientId + usageMoment [+ time para lúpulos])
    if (Array.isArray(ingredients)) {
      const seen = new Set();
      for (const ing of ingredients) {
        let key = `${ing.ingredientId}__${ing.usageMoment}`;
        if (ing.usageMoment === 'boil' || ing.usageMoment === 'hopstand' || ing.usageMoment === 'whirlpool' || ing.usageMoment === 'dry_hop') {
          key = `${ing.ingredientId}__${ing.usageMoment}__${ing.time ?? 'null'}`;
        }
        if (seen.has(key)) {
          throw new BadRequestException('No puede haber ingredientes duplicados con el mismo ingrediente, momento y tiempo en la receta.');
        }
        seen.add(key);
      }
    }

    // Si hay ingredientes, crear receta y luego los ingredientes en la tabla intermedia
    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({ data });
      const recipeIngredients = ingredients.map((ing) => ({
        recipeId: recipe.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        usageMoment: ing.usageMoment,
        time: ing.time ?? null,
        timeUnit: ing.timeUnit ?? null,
      }));
      await tx.recipeIngredient.createMany({ data: recipeIngredients });
      return recipe;
    });
  }

  async findAll(userId: string) {
    return this.prisma.recipe.findMany({
      where: { deletedAt: null, userId },
      include: { user: true, style: true, ingredients: true, brews: true },
    });
  }

  async findOne(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, deletedAt: null, userId },
      include: { user: true, style: true, ingredients: true, brews: true },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException('Recipe not found');
    }
    // Filtrar ingredients y manejar styleId correctamente
    const { ingredients, styleId, ...rest } = updateRecipeDto;

    // Validar duplicados (ingredientId + usageMoment [+ time para lúpulos])
    if (Array.isArray(ingredients)) {
      const seen = new Set();
      for (const ing of ingredients) {
        let key = `${ing.ingredientId}__${ing.usageMoment}`;
        if (ing.usageMoment === 'boil' || ing.usageMoment === 'hopstand' || ing.usageMoment === 'whirlpool' || ing.usageMoment === 'dry_hop') {
          key = `${ing.ingredientId}__${ing.usageMoment}__${ing.time ?? 'null'}`;
        }
        if (seen.has(key)) {;
          throw new BadRequestException('No puede haber ingredientes duplicados con el mismo ingrediente, momento y tiempo en la receta.');
        }
        seen.add(key);
      }
    }

    const data: any = { ...rest };
    if (updateRecipeDto.hasOwnProperty('styleId')) {
      if (styleId === null || styleId === undefined || styleId === '') {
        data.style = { disconnect: true };
      } else if (typeof styleId === 'string' && styleId.length > 0) {
        data.style = { connect: { id: styleId } };
      }
    }

    // Si no se envían ingredientes, solo actualizar la receta
    if (!ingredients) {
      return this.prisma.recipe.update({
        where: { id },
        data,
      });
    }

    // Si se envían ingredientes, actualizar receta y sincronizar tabla intermedia
    return this.prisma.$transaction(async (tx) => {
      // Actualizar la receta
      const updatedRecipe = await tx.recipe.update({
        where: { id },
        data,
      });

      // Borrar todos los ingredientes actuales de la receta
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });

      // Insertar los nuevos ingredientes
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const recipeIngredients = ingredients.map((ing) => {
          const base: any = {
            recipeId: id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          };

          if (ing.usageMoment !== undefined) {
            base.usageMoment = ing.usageMoment;
          }
          if (ing.time !== undefined) {
            base.time = ing.time;
          }
          if (ing.timeUnit !== undefined) {
            base.timeUnit = ing.timeUnit;
          }
          return base;
        });
        await tx.recipeIngredient.createMany({ data: recipeIngredients });
      }

      // Traer la receta con ingredientes para log
      const recetaFinal = await tx.recipe.findUnique({
        where: { id },
        include: { ingredients: true },
      });
      return updatedRecipe;
    });
  }

  async remove(id: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException('Recipe not found');
    }
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

      // DEBUG: Traer todas las brews y loguear
      const allBrews = await this.prisma.brew.findMany();

    // Verificar si hay cocciones (brews) activas asociadas a la receta
    const activeBrews = await this.prisma.brew.findMany({
      where: {
        recipeId: id,
        deletedAt: null,
      },
    });
    if (activeBrews.length > 0) {
      throw new ConflictException('No se puede eliminar la receta porque está asociada a una o más cocciones activas.');
    }

    try {
      return await this.prisma.recipe.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Recipe to delete not found');
      }
      throw error;
    }
  }
}
