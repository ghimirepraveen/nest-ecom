import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './schemas/auth.schema';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(Auth.name) private authModel: Model<AuthDocument>) {}

  async create(createAuthDto: CreateAuthDto) {
    const createdAuth = new this.authModel(createAuthDto);
    return await createdAuth.save();
  }

  async login(createAuthDto: CreateAuthDto) {
    const user = await this.authModel
      .findOne({ email: createAuthDto.email })
      .exec();
    if (user && user.password === createAuthDto.password) {
      return user;
    }
    return null;
  }

  async profile() {
    //get id form auth
    const id = '64b8c9f1e1b2c8a1d2e3f4g5'; // Example user ID
    return await this.authModel.findById(id).exec();
  }
}
