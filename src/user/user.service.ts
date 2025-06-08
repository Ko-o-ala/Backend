import { HttpException, Injectable } from '@nestjs/common';
import { UserRequestDto } from './dto/user.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async signUp(body: UserRequestDto) {
    const { email, name, password } = body;
    const isUserExist = await this.userModel.exists({ email });
    if (isUserExist) {
      throw new HttpException('해당하는 유저는 이미 존재합니다.', 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      email,
      name,
      password: hashedPassword,
    });
    return user.readOnlyData;
  }
}
