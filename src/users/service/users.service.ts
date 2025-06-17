import { HttpException, Injectable } from '@nestjs/common';
import { UserRequestDto } from '../dto/users.request.dto';
import { UsersRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';
import { UserUpdateProfileDto } from '../dto/users.update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async getAllUser() {
    const allUser = await this.userRepository.findAll();
    const readOnlyUsers = allUser.map((user) => user.readOnlyData);
    return readOnlyUsers;
  }

  async signUp(body: UserRequestDto) {
    const { userID, name, password, age, gender } = body;
    const isUserExist = await this.userRepository.existByUserID(userID);

    if (isUserExist) {
      throw new HttpException('해당하는 유저는 이미 존재합니다.', 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      userID,
      name,
      password: hashedPassword,
      age,
      gender,
    });
    return user.readOnlyData;
  }

  async updateUserProfile(userId: string, updateDto: UserUpdateProfileDto) {
    const user = await this.userRepository.findByUserID(userId);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    if (updateDto.password) {
      const hashed = await bcrypt.hash(updateDto.password, 10);
      updateDto.password = hashed;
    }

    // 프로필 업데이트
    const updatedUser = await this.userRepository.updateById(
      user._id as string,
      updateDto,
    );

    if (!updatedUser) {
      throw new HttpException('수정 실패', 500);
    }

    return updatedUser.readOnlyData;
  }
}
