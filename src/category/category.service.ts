import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { PublishCategoryDto } from './dto/publish-category.dto';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    try {
      const createdCategory = new this.categoryModel(createCategoryDto);
      return createdCategory.save();
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 11000) {
        throw new NotFoundException(
          `Category with name "${createCategoryDto.name}" already exists`,
        );
      }
      throw err;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<CategoryDocument>> {
    const filter = {};
    const total = await this.categoryModel.countDocuments(filter).exec();
    const query = this.categoryModel.find(filter);

    return paginate(query, total, paginationDto);
  }

  private ensureValidId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid category id: ${id}`);
    }
  }

  async findOne(id: string) {
    this.ensureValidId(id);
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.ensureValidId(id);
    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async publish(id: string, publishCategoryDto: PublishCategoryDto) {
    this.ensureValidId(id);
    const category = await this.categoryModel
      .findByIdAndUpdate(id, publishCategoryDto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async findAllForCustomer(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<CategoryDocument>> {
    const filter = { isPublished: true };
    const total = await this.categoryModel.countDocuments(filter).exec();
    const query = this.categoryModel.find(filter);

    return paginate(query, total, paginationDto);
  }

  async forSelect() {
    return this.categoryModel.find({ isPublished: true }).select('name').exec();
  }
}
