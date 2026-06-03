import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as slugify from 'slugify';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } },
    });
  }

  async create(data: { name: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.tag.create({ data: { name: data.name, slug } });
  }

  async update(id: number, data: { name?: string }) {
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.prisma.tag.update({ where: { id }, data: updateData });
  }

  async delete(id: number) {
    await this.prisma.tag.delete({ where: { id } });
    return { message: 'Tag deleted successfully' };
  }
}
