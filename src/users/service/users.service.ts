import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { UserRequestDto } from '../dto/users.request.dto';
import { UsersRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';
import { UserUpdateProfileDto } from '../dto/users.update-profile.dto';
import { UserSurveyDto } from '../dto/user.survey.dto';
import { UserModifySurveyDto } from '../dto/user.modify.survey.dto';
import { UpdatePreferredSoundsRankDto } from '../dto/update-preferred-sounds-rank.dto';
import { AuthService } from '../../auth/auth.service';
import { User } from '../users.schema';
import { CreateHardwareDto } from '../dto/hardware.dto';
import { Survey } from '../types/survey.type';
import { formatBirthdate } from '../../common/utils/date.util';

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

    const updatedSurvey = { ...user.survey, ...dto } as Survey;
    await this.userRepository.updateSurvey(userID, updatedSurvey);

    return { message: '설문조사가 성공적으로 수정되었습니다.' };
  }

  async saveSurvey(userId: string, surveyData: UserSurveyDto) {
    const user = await this.userRepository.findByUserID(userId);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    user.survey = surveyData as Survey;
    await user.save();

    return { message: '설문조사가 성공적으로 저장되었습니다.' };
  }

  async getAllUser() {
    const allUser = await this.userRepository.findAll();
    const readOnlyUsers = allUser.map((user) => user.readOnlyData);
    return readOnlyUsers;
  }

  async signUp(body: UserRequestDto) {
    const { userID, name, password, birthdate, gender } = body;
    const isUserExist = await this.userRepository.existByUserID(userID);

    if (isUserExist) {
      throw new HttpException('해당하는 유저는 이미 존재합니다.', 403);
    }

    // 생년월일을 표준 형식으로 변환 (birthdate는 string 타입)
    const formattedBirthdate = formatBirthdate(birthdate as unknown as string);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      userID,
      name,
      password: hashedPassword,
      birthdate: new Date(formattedBirthdate),
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

    const updateData: Partial<User> = {};

    if (updateDto.name) {
      updateData.name = updateDto.name;
    }

    if (updateDto.password) {
      const hashed = await bcrypt.hash(updateDto.password, 10);
      updateData.password = hashed;
    }

    if (updateDto.birthdate) {
      // 생년월일을 표준 형식으로 변환
      const formattedBirthdate = formatBirthdate(updateDto.birthdate);
      updateData.birthdate = new Date(formattedBirthdate);
    }

    if (updateDto.gender !== undefined) {
      updateData.gender = updateDto.gender;
    }

    // 프로필 업데이트
    const updatedUser = await this.userRepository.updateById(
      String(user._id),
      updateData,
    );

    if (!updatedUser) {
      throw new HttpException('수정 실패', 500);
    }

    return updatedUser.readOnlyData;
  }

  async updatePreferredSoundsRank(
    userID: string,
    dto: UpdatePreferredSoundsRankDto,
  ) {
    const user = await this.userRepository.findByUserID(userID);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    // rank 중복 검증
    const ranks = dto.preferredSounds.map((sound) => sound.rank);
    const uniqueRanks = new Set(ranks);
    if (ranks.length !== uniqueRanks.size) {
      throw new BadRequestException('중복된 rank가 존재합니다.');
    }

    // rank가 1부터 시작하는지 검증
    const minRank = Math.min(...ranks);
    if (minRank < 1) {
      throw new BadRequestException('rank는 1부터 시작해야 합니다.');
    }

    // preferredSounds 업데이트
    await this.userRepository.updatePreferredSoundsRank(
      userID,
      dto.preferredSounds,
    );

    return {
      message: '선호 사운드 rank가 성공적으로 업데이트되었습니다.',
      preferredSounds: dto.preferredSounds,
    };
  }

  async createHardware(
    userID: string,
    createHardwareDto: CreateHardwareDto,
  ): Promise<{
    message: string;
    hardware: { isHardware: boolean; RGB: string };
  }> {
    const user = await this.userRepository.findByUserID(userID);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    const hardware = {
      isHardware: true,
      RGB: createHardwareDto.RGB,
    };

    await this.userRepository.updateHardware(userID, hardware);

    return {
      message: '하드웨어 LED 설정이 성공적으로 저장되었습니다.',
      hardware,
    };
  }

  async getHardware(
    userID: string,
  ): Promise<{ userID: string; isHardware: boolean; RGB: string }> {
    const user = await this.userRepository.findByUserID(userID);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', 404);
    }

    const hardware = await this.userRepository.getHardware(userID);

    if (!hardware) {
      throw new HttpException('하드웨어 설정이 없습니다.', 404);
    }

    return {
      userID,
      ...hardware,
    };
  }
}
