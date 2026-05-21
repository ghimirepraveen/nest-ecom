import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsBoolean } from 'class-validator';
export class PublishCategoryDto extends PartialType(CreateCategoryDto) {
  @IsBoolean()
  isPublished?: boolean;
}
