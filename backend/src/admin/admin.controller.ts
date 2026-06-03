import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UserRole } from '../types';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('articles/pending')
  async getPendingArticles(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getPendingArticles(page ? +page : 1, limit ? +limit : 10);
  }

  @Post('articles/:id/approve')
  async approveArticle(@Param('id') id: string) {
    return this.adminService.approveArticle(+id);
  }

  @Post('articles/:id/reject')
  async rejectArticle(@Param('id') id: string, @Body() data: { reason: string }) {
    return this.adminService.rejectArticle(+id, data.reason);
  }

  @Get('users')
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers(page ? +page : 1, limit ? +limit : 10);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() data: { role: UserRole }) {
    return this.adminService.updateUserRole(+id, data.role);
  }
}
