import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true,
        articles: { where: { status: 'PUBLISHED' }, take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async update(id: number, data: { bio?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true },
    });
  }
}
