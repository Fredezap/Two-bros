import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}
// todo: create parece estar andando bien
// todo: trabajar en update (y habilitar la edicion siempre y cuando no hayan recetas relacionadas)
// todo: y tambien sobre el modal, que tiene algunos errores, junto con lo de iniciar coccion
// todo: pero tambien lo de escalar, y los numeros que le agrega un 0 adelante, etc.
// todo: luego pasar al de eliminar (siempre y cuando no hayan recetas relacionadas)
  
// todo: con eso ya podriamos pasar a la seccion cocciones quiza.
// todo: para finalmente ir a trabajar sobre ingredientes y demas
// todo: por ultimo ir a recetas disponibles segun ingredientes 
// todo: y luego de eso probar todo y ya deberia estar bastante completo
async create(createRecipeDto: CreateRecipeDto) {
      // Separar ingredients del resto
      const { styleId, ingredients, ...rest } = createRecipeDto;
      const data: any = { ...rest };
      if (styleId) {
        data.style = { connect: { id: styleId } };
      }

      // Si no hay ingredientes, solo crear la receta
      if (!ingredients || ingredients.length === 0) {
        return this.prisma.recipe.create({ data });
      }

      // Si hay ingredientes, crear receta y luego los ingredientes en la tabla intermedia
      return this.prisma.$transaction(async (tx) => {
        const recipe = await tx.recipe.create({ data });
        const recipeIngredients = ingredients.map((ing) => ({
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          usageMoment: ing.usageMoment,
        }));
        await tx.recipeIngredient.createMany({ data: recipeIngredients });
        return recipe;
      });
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      where: { deletedAt: null },
      include: { user: true, style: true, ingredients: true, brews: true },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { user: true, style: true, ingredients: true, brews: true },
    });
    if (!recipe || recipe.deletedAt) {
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
    const data: any = { ...rest };
    if (updateRecipeDto.hasOwnProperty('styleId')) {
      if (styleId === null || styleId === undefined || styleId === '') {
        data.style = { disconnect: true };
      } else if (typeof styleId === 'string' && styleId.length > 0) {
        data.style = { connect: { id: styleId } };
      }
    }
    return this.prisma.recipe.update({
      where: { id },
      data,
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
