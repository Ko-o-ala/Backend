import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  RecommendSound,
  RecommendSoundDocument,
} from '../recommend-sound.schema';
import { UsersRepository } from '../../users/users.repository';
import { SleepDataService } from '../../sleep-data/service/sleep-data.service';
import { RecommendSoundRequestDto } from '../dto/recommend-sound.request.dto';
import { RecommendSoundResponseDto } from '../dto/recommend-sound.response.dto';

@Injectable()
export class RecommendSoundService {
  constructor(
    @InjectModel(RecommendSound.name)
    private readonly recommendSoundModel: Model<RecommendSoundDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly sleepDataService: SleepDataService,
    private readonly httpService: HttpService,
  ) {}

  async executeRecommendation(
    requestDto: RecommendSoundRequestDto,
  ): Promise<RecommendSoundResponseDto> {
    const { userID } = requestDto;

    try {
      // 1. 사용자 정보 및 설문조사 데이터 가져오기
      const user = await this.usersRepository.findByUserID(userID);
      if (!user) {
        throw new HttpException(
          '사용자를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.survey) {
        throw new HttpException(
          '사용자의 설문조사 데이터가 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. 생체 데이터 존재 여부 확인 (현재는 생체 데이터가 없는 경우만 처리)
      const today = new Date().toISOString();
      // let hasBiometricData = false; // 향후 생체 데이터 처리 로직을 위해 주석처리

      try {
        // 생체 데이터가 있는지 확인 (에러가 발생하면 없는 것으로 간주)
        await this.sleepDataService.getSleepDataByDate(
          userID,
          today.split('T')[0],
        );
        // hasBiometricData = true; // 향후 생체 데이터 처리 로직을 위해 주석처리
      } catch {
        // 생체 데이터가 없는 경우 - 현재는 기본 로직으로 진행
        // hasBiometricData = false; // 향후 생체 데이터 처리 로직을 위해 주석처리
      }

      // 3. 추천 알고리즘에 전송할 데이터 구성
      const requestData = {
        userID: userID,
        date: today,
        survey: user.survey,
      };

      // 4. 추천 알고리즘 API 호출
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.RECOMMEND_ALGORITHM_URL}/recommend`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.status !== 200) {
        throw new HttpException(
          '추천 알고리즘 호출에 실패했습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const recommendationResult: RecommendSoundResponseDto = response.data;

      // 5. 추천 결과를 MongoDB에 저장
      const recommendSound = new this.recommendSoundModel({
        userId: recommendationResult.userId,
        date: recommendationResult.date,
        recommendation_text: recommendationResult.recommendation_text,
        recommended_sounds: recommendationResult.recommended_sounds,
      });

      await recommendSound.save();

      return recommendationResult;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // HTTP 요청 관련 오류 처리 - 타입 안전성을 위해 더 엄격하게 체크
      if (error && typeof error === 'object' && 'code' in error) {
        const errorWithCode = error as { code: string };
        if (
          errorWithCode.code === 'ECONNREFUSED' ||
          errorWithCode.code === 'ENOTFOUND'
        ) {
          throw new HttpException(
            '추천 알고리즘 서버에 연결할 수 없습니다.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        '추천 서비스 실행 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 생체 데이터가 있는 경우를 위한 메서드 (향후 구현 예정)
  // async executeRecommendationWithBiometricData(
  //   requestDto: RecommendSoundRequestDto,
  // ): Promise<RecommendSoundResponseDto> {
  //   // TODO: 생체 데이터가 있는 경우의 로직 구현
  //   throw new HttpException(
  //     '생체 데이터가 있는 경우의 추천은 아직 구현되지 않았습니다.',
  //     HttpStatus.NOT_IMPLEMENTED,
  //   );
  // }
}
