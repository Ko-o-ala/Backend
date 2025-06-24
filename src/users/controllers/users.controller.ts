import { UserModifySurveyDto } from './../dto/user.modify.survey.dto';
import {
  Body,
  Controller,
  Get,
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
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users.schema';
import { ReadOnlyUserDto } from '../dto/user.dto';
import { UserRequestDto } from '../dto/users.request.dto';
import { LoginRequestDto } from 'src/auth/dto/login.request.dto';
import { UserUpdateProfileDto } from '../dto/users.update-profile.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { UpdateProfileSwaggerDataDto } from '../dto/user.update-profile.swagger.dto';
import { UserSurveyDto } from '../dto/user.survey.dto';
import { UserSurveySuccessResponseDto } from '../dto/user.survey.success.response.dto';
import { UserSurveySuccessModifyResponseDto } from '../dto/user.survey.success.modify.response.dto';

@Controller('users')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService, // dependency injection을 하려면 해당하는 모듈을 module파일에서 import 해야됨.
  ) {}

  @ApiSuccessResponse(UpdateProfileSwaggerDataDto)
  @ApiOperation({
    summary: '[finish] 현재 user 데이터 가져오기',
    description: 'Authorization : Bearer + [token] 필요',
  })
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

  @ApiSuccessResponse(UpdateProfileSwaggerDataDto)
  @ApiResponse({
    status: 500,
    description: 'Server Error...',
  })
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[finish] 회원정보 데이터 수정',
    description: 'Authorization : Bearer + [token] 필요',
  })
  async userProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UserUpdateProfileDto,
  ) {
    return this.userService.updateUserProfile(user.userID, updateProfileDto);
  }

  @ApiSuccessResponse(UserSurveySuccessResponseDto)
  @UseGuards(JwtAuthGuard)
  @Patch('survey')
  @ApiOperation({
    summary: '[finish] 사용자 초기 설문조사 저장 ',
    description:
      '1. Authorization : Bearer + [token] 필요 / 2. 기타(Other) 칸 클릭시 Other 칸 안에 값 입력 필수',
  })
  async userSurvey(
    @CurrentUser() user: User,
    @Body() surveyDto: UserSurveyDto,
  ) {
    return this.userService.saveSurvey(user.userID, surveyDto);
  }

  @ApiExtraModels(UserModifySurveyDto)
  @ApiBody({
    schema: {
      example: {
        lightColorTemperature: 'neutral',
        youtubeContentType: 'asmr',
      },
    },
  })
  @Patch('survey/modify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[finish] 사용자 설문조사 수정',
    description: '이미 저장된 설문조사를 수정. 설문이 없으면 오류 반환.',
  })
  @ApiSuccessResponse(UserSurveySuccessModifyResponseDto)
  async modifySurvey(
    @CurrentUser() user: User,
    @Body() dto: UserModifySurveyDto,
  ) {
    return await this.userService.modifySurvey(user.userID, dto);
  }

  @ApiSuccessResponse(UpdateProfileSwaggerDataDto)
  @ApiOperation({ summary: '[finish] 모든 유저 정보 가져오기' })
  @Get('all')
  getAllUser() {
    return this.userService.getAllUser();
  }

  @ApiSuccessResponse(UpdateProfileSwaggerDataDto)
  @ApiOperation({ summary: '[개발중] 모든 유저 정보 가져오기' })
  @Get('')
  getA() {
    return this.userService.getAllUser();
  }
}
