import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { UserRequestDto } from '../dto/users.request.dto';
import { UsersRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';
import { UserUpdateProfileDto } from '../dto/users.update-profile.dto';
import { UserSurveyDto } from '../dto/user.survey.dto';
import { UserModifySurveyDto } from '../dto/user.modify.survey.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  // dependency injection을 하려면 해당하는 모듈을 module파일에서 import 해야됨.

  async getSurveyByUserID(userID: string) {
    const user = await this.userRepository.findByUserID(userID);

    if (!user || !user.survey) {
      throw new HttpException('설문조사 데이터가 없습니다.', 404);
    }

    return user.survey;
  }

  async modifySurvey(userID: string, dto: UserModifySurveyDto) {
    const user = await this.userRepository.findByUserID(userID);
    if (!user || !user.survey) {
      throw new BadRequestException('설문조사가 없습니다.');
    }

    const updatedSurvey = { ...user.survey, ...dto };
    await this.userRepository.updateSurvey(userID, updatedSurvey);

    return { message: '설문조사가 성공적으로 수정되었습니다.' };
  }

  async saveSurvey(userId: string, surveyData: UserSurveyDto) {
    const user = await this.userRepository.findByUserID(userId);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    user.survey = surveyData;
    await user.save();

    return { message: '설문조사가 성공적으로 저장되었습니다.' };
  }

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

    const payload = { userId: userID, sub: user._id };
    const token = this.authService.getSignedJwtToken(payload); // `jwtLogIn`과 비슷한 형태의 메서드 사용

    return {
      ...user.readOnlyData,
      token,
    };
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
