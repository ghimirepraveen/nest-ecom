import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './schemas/auth.schema';
import { Token, TokenDocument } from './schemas/token.schema';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-aut.dto';
import { VerifyOtpAuthDto } from './dto/verifyOtp-auth.dto';
import { signJwt } from './utils/jwt.util';
import { MailService } from '../mail/mail.service';
import { SendOtpAuthDto } from './dto/sendOtp-auth.dto';
import * as bcrypt from 'bcrypt';
import { USERTYPE } from './constant';

export type AuthenticatedUserDetails = {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly mailService: MailService,
  ) {}

  //JUST FOR TESTING will be removed later
  async create(createAuthDto: CreateAuthDto) {
    try {
      const createdAuth = new this.authModel(createAuthDto);

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      createdAuth.password = hashedPassword;

      const user = await createdAuth.save();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresIn = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
      user.userType = USERTYPE.ADMIN;
      await user.save();

      try {
        await this.mailService.sendEmail({
          subject: 'Your verification code',
          template: 'otp',
          context: { otp, email: user.email, expiresIn },
        });
      } catch (err) {
        const msg =
          err instanceof Error
            ? `User created but failed to send OTP email: ${err.message}`
            : 'User created but failed to send OTP email due to unknown error';
        throw new UnauthorizedException(msg);
      }
    } catch (err) {
      //DUplicate email error handling
      if (err instanceof Error && 'code' in err && err.code === 11000) {
        throw new UnauthorizedException('Email already exists');
      }
      throw err;
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.authModel
      .findOne({ email: loginAuthDto.email })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.createTokensForUser(user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const tokenRecord = await this.tokenModel.findOne({ userId, refreshToken });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const user = await this.authModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.createTokensForUser(user);
  }

  async profile(userId: string) {
    return await this.authModel.findById(userId).select('-password').exec();
  }

  async getUserById(userId: string): Promise<AuthenticatedUserDetails> {
    const user = await this.authModel
      .findById(userId)
      .select('-password -otp -otpExpiresAt')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      role: user.userType,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified ?? false,
    };
  }

  async verifyOtp(verifyOtpAuthDto: VerifyOtpAuthDto) {
    const user = await this.authModel
      .findOne({ email: verifyOtpAuthDto.email })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isEmailVerified) {
      throw new UnauthorizedException('Email already verified');
    }

    if (user.otp !== verifyOtpAuthDto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return await this.createTokensForUser(user);
  }

  async sendOtp(sendOtpAuthDto: SendOtpAuthDto) {
    const user = await this.authModel
      .findOne({ email: sendOtpAuthDto.email })
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    await user.save();

    try {
      await this.mailService.sendEmail({
        subject: 'Your verification code',
        template: 'otp',
        context: { otp, email: user.email, expiresIn },
      });
      return { message: 'OTP sent successfully' };
    } catch (err) {
      const msg =
        err instanceof Error
          ? `Failed to send OTP email: ${err.message}`
          : 'Failed to send OTP email due to unknown error';
      throw new UnauthorizedException(msg);
    }
  }

  private async createTokensForUser(user: AuthDocument) {
    const payload = { sub: user._id.toString(), email: user.email };

    const accessToken = signJwt(
      payload,
      process.env.JWT_ACCESS_SECRET || 'access-secret',
      '15m',
    );

    const refreshToken = signJwt(
      payload,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      '7d',
    );

    await this.tokenModel.findOneAndUpdate(
      { userId: user._id.toString() },
      {
        userId: user._id.toString(),
        accessToken,
        refreshToken,
      },
      { upsert: true, new: true },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }
}
