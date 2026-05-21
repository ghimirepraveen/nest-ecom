import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PublishCategoryDto } from './dto/publish-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypeGuard } from '../auth/guards/userType.guard';
import { USERTYPE } from '../auth/constant';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard)
  findAllForCustomer(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAllForCustomer(paginationDto);
  }

  @Get('for-select')
  @UseGuards(JwtAuthGuard)
  forSelect() {
    return this.categoryService.forSelect();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  publish(
    @Param('id') id: string,
    @Body() publishCategoryDto: PublishCategoryDto,
  ) {
    return this.categoryService.publish(id, publishCategoryDto);
  }
}
