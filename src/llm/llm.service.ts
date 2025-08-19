import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SleepDataService } from '../sleep-data/service/sleep-data.service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class LlmService {
  constructor(
    private readonly authService: AuthService,
    private readonly sleepDataService: SleepDataService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
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
}
