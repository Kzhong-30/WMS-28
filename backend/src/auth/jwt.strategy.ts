import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'tech-community-secret-key-2024',
    });
  }

  async validate(payload: { userId: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
    return { userId: payload.userId, role: user?.role };
  }
}
