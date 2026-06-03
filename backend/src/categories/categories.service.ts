import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } },
    });
  }

  async create(data: { name: string; description?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.category.create({
      data: { name: data.name, slug, description: data.description },
    });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.prisma.category.update({ where: { id }, data: updateData });
  }

  async delete(id: number) {
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
