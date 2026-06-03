import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerDto.username}`,
      },
      select: { id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true },
    });
    const token = this.jwtService.sign({ userId: user.id });
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ userId: user.id });
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, username: true, email: true, avatar: true, role: true, bio: true, createdAt: true },
    });
    return user;
  }
}
