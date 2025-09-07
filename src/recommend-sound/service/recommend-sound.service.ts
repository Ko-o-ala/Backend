import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecommendSound } from '../schema/recommend-sound.schema';
import { User } from '../../users/users.schema';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ExecuteRecommendRequestDto } from '../dto/execute-recommend.request.dto';
import { GetRecommendResultsResponseDto } from '../dto/get-recommend-results.response.dto';
import {
  parseDateToKST,
  getKSTDayBoundaries,
  getKSTPreviousDayBoundaries,
} from '../../common/utils/date.util';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Survey } from '../../users/types/survey.type';
import {
  AlgorithmRequestData,
  AlgorithmResponse,
  AvgSleepData,
  PreviousRecommendation,
  SleepDataRatio,
  SoundData,
} from '../types/algorithm-request.types';

@Injectable()
export class RecommendSoundService {
  constructor(
    @InjectModel(RecommendSound.name)
    private readonly recommendSoundModel: Model<RecommendSound>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 사용자의 설문조사 데이터를 정리하여 반환합니다.
   */
  private prepareSurveyData(user: User): Survey {
    return {
      ...user.survey,
      preferenceBalance: user.survey.preferenceBalance || 0.5,
      noisePreferenceOther: user.survey.noisePreferenceOther || '',
      emotionalSleepInterferenceOther:
        user.survey.emotionalSleepInterferenceOther || '',
      calmingSoundTypeOther: user.survey.calmingSoundTypeOther || '',
    };
  }

  /**
   * 전날의 생체 데이터를 조회합니다.
   */
  private async getPreviousSleepData(
    userID: string,
    targetDate: Date,
  ): Promise<AvgSleepData | null> {
    const previousDate = new Date(targetDate);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    const previousStartOfDay = new Date(previousDate);
    previousStartOfDay.setUTCHours(0, 0, 0, 0);
    const previousEndOfDay = new Date(previousDate);
    previousEndOfDay.setUTCHours(23, 59, 59, 999);

    return (await this.connection.collection('avgSleepData').findOne({
      userID,
      date: {
        $gte: new Date(
          Date.UTC(
            previousDate.getUTCFullYear(),
            previousDate.getUTCMonth(),
            previousDate.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        ),
        $lt: new Date(
          Date.UTC(
            previousDate.getUTCFullYear(),
            previousDate.getUTCMonth(),
            previousDate.getUTCDate() + 1,
            0,
            0,
            0,
            0,
          ),
        ),
      },
    })) as AvgSleepData | null;
  }

  /**
   * 전날의 추천 결과를 조회합니다.
   */
  private async getPreviousRecommendation(
    userID: string,
    targetDate: Date,
  ): Promise<PreviousRecommendation | null> {
    const { startOfDay: previousStartOfDay, endOfDay: previousEndOfDay } =
      getKSTPreviousDayBoundaries(targetDate);

    return (await this.recommendSoundModel
      .findOne({
        userId: userID,
        date: {
          $gte: previousStartOfDay,
          $lt: previousEndOfDay,
        },
      })
      .exec()) as PreviousRecommendation | null;
  }

  /**
   * 사용자의 선호 사운드와 전날 추천 결과에서 상위 3개를 추출합니다.
   */
  private prepareSoundData(
    user: User,
    previousRecommendation: PreviousRecommendation | null,
  ): SoundData {
    // 사용자의 preferredSounds 조회 (rank 1,2,3위)
    const userPreferredSounds = user.preferredSounds || [];
    const top3PreferredSounds = userPreferredSounds
      .filter((sound) => sound.rank <= 3)
      .sort((a, b) => a.rank - b.rank)
      .map((sound) => sound.filename);

    // 전날 추천 결과에서 rank 1,2,3위만 추출
    const top3PreviousRecommendations = previousRecommendation
      ? previousRecommendation.recommended_sounds
          .filter((sound) => sound.rank <= 3)
          .sort((a, b) => a.rank - b.rank)
          .map((sound) => sound.filename)
      : [];

    return {
      preferredSounds: top3PreferredSounds,
      previousRecommendations: top3PreviousRecommendations,
    };
  }

  /**
   * 생체 데이터를 SleepDataRatio 형태로 변환합니다.
   */
  private convertToSleepDataRatio(avgSleepData: AvgSleepData): SleepDataRatio {
    return {
      awakeRatio: avgSleepData.ratio.awakeRatio,
      deepSleepRatio: avgSleepData.ratio.deepSleepRatio,
      lightSleepRatio: avgSleepData.ratio.lightSleepRatio,
      remSleepRatio: avgSleepData.ratio.remSleepRatio,
      sleepScore: avgSleepData.sleepScore,
    };
  }

  /**
   * 알고리즘 서버에 요청을 보내고 응답을 받습니다.
   */
  private async callAlgorithmAPI(
    endpoint: string,
    requestData: AlgorithmRequestData,
  ): Promise<AlgorithmResponse> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${process.env.RECOMMEND_ALGORITHM_URL}${endpoint}`,
        requestData,
        {
          validateStatus: (status) => status < 500,
        },
      ),
    );

    console.log('=== 알고리즘 서버 통신 로그 ===');
    console.log('전송된 요청 데이터:');
    console.log(JSON.stringify(requestData, null, 2));
    console.log('받은 응답 상태:', response.status);
    console.log('받은 응답 데이터:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('================================');

    if (response.status !== 200) {
      console.error('알고리즘 서버 에러 응답:', response.data);
      throw new HttpException(
        '알고리즘 서버에서 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response.data as AlgorithmResponse;
  }

  async executeRecommend(
    executeRecommendDto: ExecuteRecommendRequestDto,
  ): Promise<any> {
    try {
      const { userID, date } = executeRecommendDto;

      // 사용자 정보 조회
      const user = await this.userModel.findOne({ userID }).exec();
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

      // 필수 필드 검증
      if (
        user.survey.preferenceBalance === undefined ||
        user.survey.preferenceBalance === null
      ) {
        throw new HttpException(
          '설문조사에 preferenceBalance 필드가 누락되었습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 한국 시간대 기준으로 날짜 처리
      const targetDate = parseDateToKST(date);
      const { startOfDay, endOfDay } = getKSTDayBoundaries(targetDate);

      console.log('🔍 디버깅 로그:');
      console.log('요청된 날짜:', date);
      console.log('targetDate:', targetDate);
      console.log('startOfDay:', startOfDay);
      console.log('endOfDay:', endOfDay);

      const currentAvgSleepData = await this.connection
        .collection('avgSleepData')
        .findOne({
          userID,
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        });

      console.log('조회된 생체 데이터:', currentAvgSleepData);
      console.log('생체 데이터 존재 여부:', !!currentAvgSleepData);

      // 기존 추천 결과가 있는지 확인 (한국 시간대 기준)
      const { startOfDay: previousStartOfDay, endOfDay: previousEndOfDay } =
        getKSTPreviousDayBoundaries(targetDate);

      console.log('🔍 날짜 계산 디버깅:');
      console.log('요청된 날짜:', targetDate);
      console.log('전날 시작:', previousStartOfDay);
      console.log('전날 끝:', previousEndOfDay);

      const existingRecommendation = await this.recommendSoundModel
        .findOne({
          userId: userID,
          date: {
            $gte: previousStartOfDay,
            $lt: previousEndOfDay,
          },
        })
        .exec();

      console.log('🔍 추천 결과 조회 디버깅:');
      console.log('조회 조건:', {
        userId: userID,
        date: {
          $gte: previousStartOfDay,
          $lte: previousEndOfDay,
        },
      });
      console.log('조회된 추천 결과:', existingRecommendation);
      console.log('추천 결과 존재 여부:', !!existingRecommendation);

      let recommendationResult: AlgorithmResponse;

      if (currentAvgSleepData) {
        // 생체 데이터가 있는 경우
        if (existingRecommendation) {
          // 생체 데이터 + 기존 추천 결과가 있는 경우
          const previousAvgSleepData = await this.getPreviousSleepData(
            userID,
            targetDate,
          );
          const previousRecommendation = await this.getPreviousRecommendation(
            userID,
            targetDate,
          );
          const soundData = this.prepareSoundData(user, previousRecommendation);
          const surveyData = this.prepareSurveyData(user);

          const algorithmRequestData: AlgorithmRequestData = {
            userID: userID,
            date: date,
            sleepData: {
              current: this.convertToSleepDataRatio(
                currentAvgSleepData as unknown as AvgSleepData,
              ),
              previous: previousAvgSleepData
                ? this.convertToSleepDataRatio(previousAvgSleepData)
                : undefined,
            },
            sounds: soundData,
            survey: surveyData,
          };

          console.log(
            'API 호출: /recommend/combined (생체데이터 + 기존추천결과 있음)',
          );
          recommendationResult = await this.callAlgorithmAPI(
            '/recommend/combined',
            algorithmRequestData,
          );
        } else {
          // 생체 데이터만 있는 경우 (기존 추천 결과 없음)
          const previousAvgSleepData = await this.getPreviousSleepData(
            userID,
            targetDate,
          );
          const surveyData = this.prepareSurveyData(user);

          const algorithmRequestData: AlgorithmRequestData = {
            userID: userID,
            date: date,
            sleepData: {
              current: this.convertToSleepDataRatio(
                currentAvgSleepData as unknown as AvgSleepData,
              ),
              previous: previousAvgSleepData
                ? this.convertToSleepDataRatio(previousAvgSleepData)
                : undefined,
            },
            survey: surveyData,
          };

          console.log(
            'API 호출: /recommend/combined/new (생체데이터만 있음, 기존추천결과 없음)',
          );
          recommendationResult = await this.callAlgorithmAPI(
            '/recommend/combined/new',
            algorithmRequestData,
          );
        }
      } else {
        // 생체 데이터가 없는 경우
        const previousRecommendation = await this.getPreviousRecommendation(
          userID,
          targetDate,
        );
        const soundData = this.prepareSoundData(user, previousRecommendation);
        const surveyData = this.prepareSurveyData(user);

        const algorithmRequestData: AlgorithmRequestData = {
          userID: userID,
          date: date,
          survey: surveyData,
          sounds: soundData,
        };

        console.log(
          'API 호출: /recommend (생체데이터 없음, 설문조사 + 사운드 데이터)',
        );
        recommendationResult = await this.callAlgorithmAPI(
          '/recommend',
          algorithmRequestData,
        );
      }

      // Mongoose 모델을 사용하여 저장 (timestamps 자동 생성)
      const newRecommendSound = new this.recommendSoundModel({
        userId: userID,
        date: targetDate,
        recommendation_text: recommendationResult.recommendation_text,
        recommended_sounds: recommendationResult.recommended_sounds,
      });

      await newRecommendSound.save();

      return {
        message: '추천 알고리즘이 성공적으로 실행되었습니다.',
        data: {
          userId: userID,
          date: targetDate.toISOString(),
          recommendation_text: recommendationResult.recommendation_text,
          recommended_sounds: recommendationResult.recommended_sounds,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('추천 알고리즘 실행 중 오류:', error);
      throw new HttpException(
        '추천 알고리즘 실행 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecommendResults(
    userID: string,
    date: string,
  ): Promise<GetRecommendResultsResponseDto> {
    try {
      // 날짜 형식 검증 (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException(
          '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 사용자 존재 여부 확인
      const user = await this.userModel.findOne({ userID }).exec();
      if (!user) {
        throw new HttpException(
          '사용자를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      // 한국 시간대 기준으로 날짜 처리
      const targetDate = parseDateToKST(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // 해당 날짜의 모든 추천 결과 조회 후 가장 최신 데이터 선택
      const recommendations = await this.recommendSoundModel
        .find({
          userId: userID,
          date: {
            $gte: targetDate,
            $lt: nextDate,
          },
        })
        .sort({ createdAt: -1, updatedAt: -1 }) // createdAt과 updatedAt 모두 내림차순 정렬
        .exec();

      if (!recommendations || recommendations.length === 0) {
        throw new HttpException(
          '해당 날짜의 추천 결과를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      // 가장 최신 데이터 선택 (createdAt과 updatedAt이 가장 늦은 것)
      const recommendation = recommendations[0];

      if (!recommendation) {
        throw new HttpException(
          '해당 날짜의 추천 결과를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      // 응답 데이터 구성 (createdAt, updatedAt 포함)
      return {
        userId: recommendation.userId,
        date: date,
        recommendation_text: recommendation.recommendation_text,
        recommended_sounds: recommendation.recommended_sounds.map((sound) => ({
          filename: sound.filename,
          rank: sound.rank,
        })),
        createdAt: recommendation.createdAt,
        updatedAt: recommendation.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('추천 결과 조회 중 오류:', error);
      throw new HttpException(
        '추천 결과 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 사용자의 가장 최근 추천 결과를 가져옵니다.
   */
  async getMostRecentRecommendResult(userID: string) {
    try {
      // 해당 사용자의 가장 최근 추천 결과 조회
      const mostRecentRecommendation = await this.recommendSoundModel
        .findOne({ userId: userID })
        .sort({ createdAt: -1, updatedAt: -1 }) // createdAt과 updatedAt 모두 내림차순 정렬
        .exec();

      if (!mostRecentRecommendation) {
        return [];
      }

      return {
        userId: mostRecentRecommendation.userId,
        date: mostRecentRecommendation.date.toISOString().split('T')[0], // YYYY-MM-DD 형식
        recommendation_text: mostRecentRecommendation.recommendation_text,
        recommended_sounds: mostRecentRecommendation.recommended_sounds,
        createdAt: mostRecentRecommendation.createdAt,
        updatedAt: mostRecentRecommendation.updatedAt,
      };
    } catch (error) {
      console.error('최근 추천 결과 조회 중 오류:', error);
      return [];
    }
  }
}
