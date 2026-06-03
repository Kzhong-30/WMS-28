import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  async findAll() {
    return this.tagsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() data: { name: string }) {
    return this.tagsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.tagsService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(+id);
  }
}
