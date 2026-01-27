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
}
