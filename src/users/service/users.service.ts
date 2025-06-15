import { HttpException, Injectable } from '@nestjs/common';
import { UserRequestDto } from '../dto/users.request.dto';
import { UsersRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';

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
}
