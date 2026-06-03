import { IsString, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';
import { ArticleStatus } from '../../types';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  tagIds?: number[];
}
