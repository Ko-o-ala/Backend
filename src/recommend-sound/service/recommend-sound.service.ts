import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RecommendSound } from '../schema/recommend-sound.schema';
import { User } from '../../users/users.schema';
import { SleepData } from '../../sleep-data/schema/sleep-data.schema';
import { ExecuteRecommendRequestDto } from '../dto/execute-recommend.request.dto';
import { ExecuteRecommendResponseDto } from '../dto/execute-recommend.response.dto';

@Injectable()
export class RecommendSoundService {
  constructor(
    @InjectModel(RecommendSound.name)
    private readonly recommendSoundModel: Model<RecommendSound>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(SleepData.name)
    private readonly sleepDataModel: Model<SleepData>,
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

      // 날짜를 MongoDB Date 형식으로 변환
      const targetDate = new Date(date + 'T00:00:00.000+00:00');

      // 생체 데이터 조회 (있는 경우와 없는 경우를 구분)
      // TODO: 생체 데이터가 있는 경우 추가 로직 구현
      await this.sleepDataModel.findOne({ userID, date: targetDate }).exec();

      // 알고리즘 서버로 전송할 데이터 구성
      // 날짜를 +00:00 형식으로 변환 (Z 대신)
      const dateString = targetDate.toISOString().replace('Z', '+00:00');

      // 알고리즘 서버가 기대하는 필드 구조에 맞춰 survey 데이터 구성
      const surveyData = {
        ...user.survey,
        preferenceBalance: user.survey.preferenceBalance || 0.5, // 기본값 설정
        youtubeContentTypeOther: user.survey.youtubeContentTypeOther || '', // 빈 문자열로 설정
        // 필요한 경우 다른 필드들도 기본값으로 설정
      };

      const algorithmRequestData = {
        userID: userID,
        date: dateString,
        survey: surveyData,
        // TODO: 생체 데이터가 있는 경우 추가 로직 구현
        // 현재는 생체 데이터가 없는 경우만 처리
      };

      // 알고리즘 서버에 요청 전송
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.RECOMMEND_ALGORITHM_URL}/recommend`,
          algorithmRequestData,
          {
            validateStatus: (status) => status < 500, // 422도 성공으로 처리
          },
        ),
      );

      console.log('알고리즘 서버 응답 상태:', response.status);
      console.log(
        '알고리즘 서버 응답 데이터:',
        JSON.stringify(response.data, null, 2),
      );
      console.log(
        '요청 데이터:',
        JSON.stringify(algorithmRequestData, null, 2),
      );

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
          preference: string;
        }>;
      } = response.data;

      // 추천 결과를 MongoDB에 저장
      const recommendSound = new this.recommendSoundModel({
        userId: userID,
        date: targetDate,
        recommendation_text: recommendationResult.recommendation_text,
        recommended_sounds: recommendationResult.recommended_sounds,
      });

      await recommendSound.save();

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
}
