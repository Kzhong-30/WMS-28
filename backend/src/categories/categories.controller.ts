import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() data: { name: string; description?: string }) {
    return this.categoriesService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.categoriesService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(+id);
  }
}
