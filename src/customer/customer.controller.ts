import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypeGuard } from '../auth/guards/userType.guard';
import { USERTYPE } from '../auth/constant';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/register.customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('register')
  register(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.register(createCustomerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  findAll(@Query() paginationDto: PaginationDto) {
    return this.customerService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, UserTypeGuard(USERTYPE.ADMIN))
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }
}
