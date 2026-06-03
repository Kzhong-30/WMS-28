import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    LikesModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {}
