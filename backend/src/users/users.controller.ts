import { Controller, Get, Param, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Body() data: { bio?: string; avatar?: string }) {
    return this.usersService.update(req.user.userId, data);
  }
}
