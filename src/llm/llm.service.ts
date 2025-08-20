import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SleepDataService } from '../sleep-data/service/sleep-data.service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { RecommendSoundService } from '../recommend-sound/service/recommend-sound.service';

@Injectable()
export class LlmService {
  constructor(
    private readonly authService: AuthService,
    private readonly sleepDataService: SleepDataService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly recommendSoundService: RecommendSoundService,
  ) {}

  /**
   * JWT 토큰을 검증하고 사용자 정보를 반환합니다.
   */
  async validateTokenAndGetUser(bearerToken: string) {
    try {
      // Bearer 토큰에서 JWT 추출
      const token = bearerToken.replace('Bearer ', '');

      // JWT 토큰 검증
      const payload: any = this.jwtService.verify(token);

      // 사용자 정보 조회
      const user = await this.usersRepository.findUserByIdWithoutPassword(
        // eslint-disable-next-line
        payload.sub,
      );

      if (!user) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      return {
        userId: user.id,
        userID: user.userID,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * 사용자의 모든 생체 데이터를 가져옵니다.
   */
  async getUserBiometricData(userID: string) {
    try {
      // sleepdatas 컬렉션에서 해당 사용자의 모든 데이터 조회
      const sleepData =
        await this.sleepDataService.getAllSleepDataByUserID(userID);

      if (!sleepData || sleepData.length === 0) {
        return {
          userID,
          message: '해당 사용자의 생체 데이터가 없습니다.',
          data: [],
          totalCount: 0,
        };
      }

      return {
        userID,
        message: '생체 데이터를 성공적으로 가져왔습니다.',
        data: sleepData,
        totalCount: sleepData.length,
      };
    } catch {
      throw new NotFoundException(
        '생체 데이터를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 사용자의 설문조사 데이터를 가져옵니다.
   */
  async getUserSurveyData(userID: string) {
    try {
      const user = await this.usersRepository.findByUserID(userID);

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      return user.survey || null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        '설문조사 데이터를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 사용자의 특정 날짜 사운드 추천 결과를 가져옵니다.
   */
  async getUserRecommendSoundData(userID: string, date: string) {
    try {
      const recommendation =
        await this.recommendSoundService.getRecommendResults(userID, date);
      return recommendation;
    } catch (error) {
      // 추천 결과가 없는 경우 null 반환 (에러가 아닌 정상적인 상황)
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 사용자의 모든 데이터를 통합하여 가져옵니다.
   */
  async getUserAllData(userID: string): Promise<{
    userID: string;
    message: string;
    biometricData: any;
    surveyData: any;
    recommendSoundData: any;
    totalCount: {
      biometricDataCount: number;
      hasSurveyData: boolean;
      hasRecommendSoundData: boolean;
    };
  }> {
    try {
      // 생체 데이터 조회
      const biometricData = await this.getUserBiometricData(userID);

      // 설문조사 데이터 조회
      const surveyData = await this.getUserSurveyData(userID);

      // 오늘 날짜의 사운드 추천 결과 조회
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const recommendSoundData = await this.getUserRecommendSoundData(
        userID,
        today,
      );

      return {
        userID,
        message: '사용자 데이터를 성공적으로 가져왔습니다.',
        biometricData,
        surveyData,
        recommendSoundData,
        totalCount: {
          biometricDataCount: biometricData.totalCount || 0,
          hasSurveyData: !!surveyData,
          hasRecommendSoundData: !!recommendSoundData,
        },
      };
    } catch (error) {
      throw new NotFoundException(
        '사용자 데이터를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }
}
