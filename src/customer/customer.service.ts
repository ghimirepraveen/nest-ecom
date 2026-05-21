import {
  Injectable,
  NotFoundException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { USERTYPE } from '../auth/constant';
import { Auth, AuthDocument } from '../auth/schemas/auth.schema';
import { CreateCustomerDto } from './dto/register.customer.dto';
import bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
    private readonly mailService: MailService,
  ) {}

  async register(createCustomerDto: CreateCustomerDto) {
    try {
      const createdAuth = new this.authModel(createCustomerDto);

      const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);
      createdAuth.password = hashedPassword;

      const user = await createdAuth.save();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresIn = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
      user.userType = USERTYPE.CUSTOMER;
      await user.save();

      void this.mailService
        .sendEmail({
          subject: 'Your verification code',
          template: 'otp',
          context: { otp, email: user.email, expiresIn },
        })
        .catch((err: unknown) => {
          const reason =
            err instanceof Error
              ? err.message
              : 'Unknown error while sending OTP';
          this.logger.warn(
            `Failed to send OTP email to ${user.email}: ${reason}`,
          );
        });
    } catch (err) {
      //du[plicate email error handling
      if (err instanceof Error && 'code' in err && err.code === 11000) {
        throw new UnprocessableEntityException('Email already exists');
      }
      throw err;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<AuthDocument>> {
    const filter = { userType: USERTYPE.CUSTOMER };
    const total = await this.authModel.countDocuments(filter).exec();
    const query = this.authModel
      .find(filter)
      .select('-password -otp -otpExpiresAt');

    return paginate(query, total, paginationDto);
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.authModel
      .findOne({ _id: id, userType: USERTYPE.CUSTOMER })
      .select('-password -otp -otpExpiresAt')
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}
