import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { UsersService } from '../service/users.service';
import { AuthService } from 'src/auth/auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users.schema';
import { ReadOnlyUserDto } from '../dto/user.dto';
import { UserRequestDto } from '../dto/users.request.dto';
import { LoginRequestDto } from 'src/auth/dto/login.request.dto';
import { UserUpdateProfileDto } from '../dto/users.update-profile.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';

@Controller('users')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService, // dependency injection을 하려면 해당하는 모듈을 module파일에서 import 해야됨.
  ) {}

  @ApiOperation({ summary: '현재 user 데이터 가져오기' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getCurrentUser(@CurrentUser() user: User) {
    return user.readOnlyData;
  }

  @ApiResponse({
    status: 500,
    description: 'Server Error...',
  })
  @ApiSuccessResponse(ReadOnlyUserDto, 201)
  @ApiOperation({ summary: '회원가입' })
  @Post('signup')
  async signUp(@Body() body: UserRequestDto) {
    return await this.userService.signUp(body);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  logIn(@Body() data: LoginRequestDto) {
    return this.authService.jwtLogIn(data);
  }

  @ApiSuccessResponse(UserUpdateProfileDto)
  @ApiResponse({
    status: 500,
    description: 'Server Error...',
  })
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 프로필 데이터 수정' })
  async userProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UserUpdateProfileDto,
  ) {
    return this.userService.updateUserProfile(user.userID, updateProfileDto);
  }

  @ApiOperation({ summary: '초기화면 설문조사' })
  @Post('survey')
  userSurvey() {
    return 'userSurvey';
  }

  @ApiOperation({ summary: '모든 유저 정보 가져오기' })
  @Get('all')
  getAllUser() {
    return this.userService.getAllUser();
  }
}
