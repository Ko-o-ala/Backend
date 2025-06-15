import { Injectable } from '@nestjs/common';
import { User } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRequestDto } from './dto/users.request.dto';
import { UserCurrentDto } from './dto/users.cuurent.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll() {
    return await this.userModel.find();
  }
  async findUserByIdWithoutPassword(
    userId: string,
  ): Promise<UserCurrentDto | null> {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }

  async findByUserID(userID: string) {
    return this.userModel.findOne({ userID });
  }

  async existByUserID(UserID: string): Promise<boolean> {
    const result = await this.userModel.exists({ UserID });
    return result ? true : false;
  }

  async create(user: UserRequestDto): Promise<User> {
    return await this.userModel.create(user);
  }

  async updateById(UserID: string, updateFields: Partial<User>) {
    return this.userModel.findByIdAndUpdate(UserID, updateFields, {
      new: true,
    });
  }
}
