import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginRequestDto } from './dto/login.request.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async jwtLogIn(data: LoginRequestDto) {
    const { userID, password } = data;

    //* 해당하는 userID가 있는지 체크
    const user = await this.userRepository.findByUserID(userID);

    if (!user) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    //* password가 일치한지
    const isPasswordValidated: boolean = await bcrypt.compare(
      password, // 받아온 비밀번호
      user.password, // 모델 안에 있는 비밀번호
    );

    if (!isPasswordValidated) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    const payload = { userId: userID, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
      userID: user.userID,
      name: user.name,
    };
  }
}