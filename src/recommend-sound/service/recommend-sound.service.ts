import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RecommendSound } from '../schema/recommend-sound.schema';
import { User } from '../../users/users.schema';

import { ExecuteRecommendRequestDto } from '../dto/execute-recommend.request.dto';
import { ExecuteRecommendResponseDto } from '../dto/execute-recommend.response.dto';
import { GetRecommendResultsResponseDto } from '../dto/get-recommend-results.response.dto';

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

  async executeRecommend(
    executeRecommendDto: ExecuteRecommendRequestDto,
  ): Promise<ExecuteRecommendResponseDto> {
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

      const targetDate = new Date(date + 'T00:00:00.000+00:00');

      const dateString = targetDate.toISOString().replace('Z', '+00:00');

      // 생체 데이터 조회 (있는 경우와 없는 경우를 구분)
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

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

      // 기존 추천 결과가 있는지 확인
      const previousDate = new Date(targetDate);
      previousDate.setUTCDate(previousDate.getUTCDate() - 1);

      const previousStartOfDay = new Date(previousDate);
      previousStartOfDay.setUTCHours(0, 0, 0, 0);
      const previousEndOfDay = new Date(previousDate);
      previousEndOfDay.setUTCHours(23, 59, 59, 999);

      console.log('🔍 날짜 계산 디버깅:');
      console.log('요청된 날짜:', targetDate);
      console.log('전날 계산:', previousDate);
      console.log('전날 시작:', previousStartOfDay);
      console.log('전날 끝:', previousEndOfDay);

      const existingRecommendation = await this.recommendSoundModel
        .findOne({
          userId: userID,
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

      let algorithmRequestData;
      let response;

      if (currentAvgSleepData) {
        // 생체 데이터가 있는 경우
        if (existingRecommendation) {
          // 생체 데이터 + 기존 추천 결과가 있는 경우
          // 전날 생체 데이터 조회
          const previousDate = new Date(targetDate);
          previousDate.setUTCDate(previousDate.getUTCDate() - 1);

          const previousStartOfDay = new Date(previousDate);
          previousStartOfDay.setUTCHours(0, 0, 0, 0);
          const previousEndOfDay = new Date(previousDate);
          previousEndOfDay.setUTCHours(23, 59, 59, 999);

          const previousAvgSleepData = await this.connection
            .collection('avgSleepData')
            .findOne({
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
            });

          // 전날 추천 결과 조회
          const previousRecommendation = await this.recommendSoundModel
            .findOne({
              userId: userID,
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
            })
            .exec();

          // 사용자의 preferredSounds 조회 (rank 1,2,3위)
          const userPreferredSounds = user.preferredSounds || [];
          const top3PreferredSounds = userPreferredSounds
            .filter((sound) => sound.rank <= 3)
            .sort((a, b) => a.rank - b.rank)
            .map((sound) => sound.filename);

          // 전날 추천 결과 조회 (rank 1,2,3위)
          const top3PreviousRecommendations = previousRecommendation
            ? previousRecommendation.recommended_sounds
                .filter((sound) => sound.rank <= 3)
                .sort((a, b) => a.rank - b.rank)
                .map((sound) => sound.filename)
            : [];

          const surveyData = {
            ...user.survey,
            preferenceBalance: user.survey.preferenceBalance || 0.5,
            youtubeContentTypeOther: user.survey.youtubeContentTypeOther || '',
          };

          algorithmRequestData = {
            userID: userID,
            date: dateString,
            sleepData: {
              current: {
                awakeRatio: currentAvgSleepData.ratio.awakeRatio,
                deepSleepRatio: currentAvgSleepData.ratio.deepSleepRatio,
                lightSleepRatio: currentAvgSleepData.ratio.lightSleepRatio,
                remSleepRatio: currentAvgSleepData.ratio.remSleepRatio,
                sleepScore: currentAvgSleepData.sleepScore,
              },
              previous: previousAvgSleepData
                ? {
                    awakeRatio: previousAvgSleepData.ratio.awakeRatio,
                    deepSleepRatio: previousAvgSleepData.ratio.deepSleepRatio,
                    lightSleepRatio: previousAvgSleepData.ratio.lightSleepRatio,
                    remSleepRatio: previousAvgSleepData.ratio.remSleepRatio,
                    sleepScore: previousAvgSleepData.sleepScore,
                  }
                : undefined,
            },
            sounds: {
              preferredSounds: top3PreferredSounds,
              previousRecommendations: top3PreviousRecommendations,
            },
            survey: surveyData,
          };

          console.log(
            'API 호출: /recommend/combined (생체데이터 + 기존추천결과 있음)',
          );
          response = await firstValueFrom(
            this.httpService.post(
              `${process.env.RECOMMEND_ALGORITHM_URL}/recommend/combined`,
              algorithmRequestData,
              {
                validateStatus: (status) => status < 500,
              },
            ),
          );
        } else {
          // 생체 데이터만 있는 경우 (기존 추천 결과 없음)
          // 전날 생체 데이터 조회 (optional)
          const previousDate = new Date(targetDate);
          previousDate.setUTCDate(previousDate.getUTCDate() - 1);

          const previousStartOfDay = new Date(previousDate);
          previousStartOfDay.setUTCHours(0, 0, 0, 0);
          const previousEndOfDay = new Date(previousDate);
          previousEndOfDay.setUTCHours(23, 59, 59, 999);

          const previousAvgSleepData = await this.connection
            .collection('avgSleepData')
            .findOne({
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
            });

          const surveyData = {
            ...user.survey,
            preferenceBalance: user.survey.preferenceBalance || 0.5,
            youtubeContentTypeOther: user.survey.youtubeContentTypeOther || '',
          };

          algorithmRequestData = {
            userID: userID,
            date: dateString,
            sleepData: {
              current: {
                awakeRatio: currentAvgSleepData.ratio.awakeRatio,
                deepSleepRatio: currentAvgSleepData.ratio.deepSleepRatio,
                lightSleepRatio: currentAvgSleepData.ratio.lightSleepRatio,
                remSleepRatio: currentAvgSleepData.ratio.remSleepRatio,
                sleepScore: currentAvgSleepData.sleepScore,
              },
              previous: previousAvgSleepData
                ? {
                    awakeRatio: previousAvgSleepData.ratio.awakeRatio,
                    deepSleepRatio: previousAvgSleepData.ratio.deepSleepRatio,
                    lightSleepRatio: previousAvgSleepData.ratio.lightSleepRatio,
                    remSleepRatio: previousAvgSleepData.ratio.remSleepRatio,
                    sleepScore: previousAvgSleepData.sleepScore,
                  }
                : undefined,
            },
            survey: surveyData,
          };

          console.log(
            'API 호출: /recommend/combined/new (생체데이터만 있음, 기존추천결과 없음)',
          );
          response = await firstValueFrom(
            this.httpService.post(
              `${process.env.RECOMMEND_ALGORITHM_URL}/recommend/combined/new`,
              algorithmRequestData,
              {
                validateStatus: (status) => status < 500,
              },
            ),
          );
        }
      } else {
        // 생체 데이터가 없는 경우
        // 전날 추천 결과 조회 (preferredSounds와 previousRecommendations 포함 가능)
        const previousDate = new Date(targetDate);
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);

        const previousStartOfDay = new Date(previousDate);
        previousStartOfDay.setUTCHours(0, 0, 0, 0);
        const previousEndOfDay = new Date(previousDate);
        previousEndOfDay.setUTCHours(23, 59, 59, 999);

        // 전날 추천 결과 조회
        const previousRecommendation = await this.recommendSoundModel
          .findOne({
            userId: userID,
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
          })
          .exec();

        // 사용자의 preferredSounds 조회 (rank 1,2,3위만)
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

        const surveyData = {
          ...user.survey,
          preferenceBalance: user.survey.preferenceBalance || 0.5,
          youtubeContentTypeOther: user.survey.youtubeContentTypeOther || '',
        };

        algorithmRequestData = {
          userID: userID,
          date: dateString,
          survey: surveyData,
          sounds: {
            preferredSounds: top3PreferredSounds,
            previousRecommendations: top3PreviousRecommendations,
          },
        };

        console.log(
          'API 호출: /recommend (생체데이터 없음, 설문조사 + 사운드 데이터)',
        );
        response = await firstValueFrom(
          this.httpService.post(
            `${process.env.RECOMMEND_ALGORITHM_URL}/recommend`,
            algorithmRequestData,
            {
              validateStatus: (status) => status < 500,
            },
          ),
        );
      }

      console.log('=== 알고리즘 서버 통신 로그 ===');
      console.log('전송된 요청 데이터:');
      console.log(JSON.stringify(algorithmRequestData, null, 2));
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

      const recommendationResult: {
        recommendation_text: string;
        recommended_sounds: Array<{
          filename: string;
          rank: number;
        }>;
      } = response.data;

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

      // 날짜를 Date 객체로 변환 (UTC 기준)
      const targetDate = new Date(date + 'T00:00:00.000Z');
      const nextDate = new Date(targetDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      // 해당 날짜의 추천 결과 조회
      const recommendation = await this.recommendSoundModel
        .findOne({
          userId: userID,
          date: {
            $gte: targetDate,
            $lt: nextDate,
          },
        })
        .exec();

      if (!recommendation) {
        throw new HttpException(
          '해당 날짜의 추천 결과를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      // 응답 데이터 구성 (createdAt, updatedAt, __v 제외)
      return {
        userId: recommendation.userId,
        date: date,
        recommendation_text: recommendation.recommendation_text,
        recommended_sounds: recommendation.recommended_sounds.map((sound) => ({
          filename: sound.filename,
          rank: sound.rank,
        })),
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
}
