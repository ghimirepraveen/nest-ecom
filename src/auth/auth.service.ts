import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './schemas/auth.schema';
import { Token, TokenDocument } from './schemas/token.schema';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-aut.dto';
import { signJwt } from './utils/jwt.util';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const createdAuth = new this.authModel(createAuthDto);

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    createdAuth.password = hashedPassword;

    const user = await createdAuth.save();
    return await this.createTokensForUser(user);
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
