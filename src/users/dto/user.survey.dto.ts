import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { RequiredIfOther } from 'src/common/validators/required.if.other';

export class UserSurveyDto {
  // Q1
  @ApiProperty({
    example: 'moodLight',
    description: 'sleepLightUsage',
  })
  @IsIn(['off', 'moodLight', 'brightLight'])
  sleepLightUsage: string;

  // Q2
  @ApiProperty({
    example: 'warmYellow',
    description: 'lightColorTemperature',
  })
  @IsIn(['coolWhite', 'neutral', 'warmYellow', 'unknown'])
  lightColorTemperature: string;

  // Q3
  @ApiProperty({
    example: 'other',
    description: 'noisePreference',
  })
  @IsIn(['silence', 'whiteNoise', 'youtube', 'other'])
  noisePreference: string;

  @ApiProperty({
    example: '팝송',
    description: 'noisePreferenceOther',
  })
  @IsOptional()
  @IsString()
  @RequiredIfOther('noisePreference', {
    message: 'noisePreference "other"일 경우 noisePreferenceOther 필수입니다.',
  })
  noisePreferenceOther: string;

  // Q4
  @ApiProperty({
    example: 'other',
    description: 'youtubeContentType',
  })
  @IsIn(['asmr', 'music', 'radio', 'drama', 'other'])
  youtubeContentType: string;

  @ApiProperty({
    example: '아이돌 영상',
    description: 'youtubeContentTypeOther',
  })
  @IsOptional()
  @IsString()
  @RequiredIfOther('youtubeContentType', {
    message:
      'youtubeContentType이 "other"일 경우 youtubeContentTypeOther는 필수입니다.',
  })
  youtubeContentTypeOther: string;

  // Q5
  @ApiProperty({
    example: '12to2am',
    description: 'usualBedtime',
  })
  @IsIn(['before9pm', '9to12pm', '12to2am', 'after2am'])
  usualBedtime: string;

  // Q6
  @ApiProperty({
    example: '7to9am',
    description: 'usualWakeupTime',
  })
  @IsIn(['before5am', '5to7am', '7to9am', 'after9am'])
  usualWakeupTime: string;

  // Q7
  @ApiProperty({
    example: 'outdoor',
    description: 'dayActivityType',
  })
  @IsIn(['indoor', 'outdoor', 'mixed'])
  dayActivityType: string;

  // Q8
  @ApiProperty({
    example: 'sometimes',
    description: 'morningSunlightExposure',
  })
  @IsIn(['daily', 'sometimes', 'rarely'])
  morningSunlightExposure: string;

  // Q9
  @ApiProperty({
    example: '1to2perWeek',
    description: 'napFrequency',
  })
  @IsIn(['daily', '3to4perWeek', '1to2perWeek', 'rarely'])
  napFrequency: string;

  // Q10
  @ApiProperty({
    example: '15to30',
    description: 'napDuration',
  })
  @IsIn(['under15', '15to30', '30to60', 'over60'])
  napDuration: string;

  // Q11
  @ApiProperty({
    example: 'afternoon',
    description: 'mostDrowsyTime',
  })
  @IsIn(['morning', 'afternoon', 'evening', 'night', 'random'])
  mostDrowsyTime: string;

  // Q12
  @ApiProperty({
    example: '4to6h',
    description: 'averageSleepDuration',
  })
  @IsIn(['under4h', '4to6h', '6to7h', '7to8h', 'over8h'])
  averageSleepDuration: string;

  // Q13
  @ApiProperty({
    example: ['fallAsleepHard', 'wakeOften', 'nightmares'],
    description: 'sleepIssues',
  })
  @IsArray()
  @IsIn(
    [
      'fallAsleepHard',
      'wakeOften',
      'wakeEarly',
      'daySleepy',
      'nightmares',
      'movesALot',
      'none',
    ],
    { each: true },
  )
  sleepIssues: string[];

  // Q14
  @ApiProperty({
    example: ['stress', 'anxiety'],
    description: 'emotionalSleepInterference',
  })
  @IsArray()
  @IsIn(['stress', 'anxiety', 'loneliness', 'tension', 'other'], { each: true })
  emotionalSleepInterference: string[];

  @ApiProperty({
    example: '',
    description: 'emotionalSleepInterferenceOther',
  })
  @RequiredIfOther('emotionalSleepInterference', {
    message:
      'emotionalSleepInterference "other"일 경우 emotionalSleepInterferenceOther 필수입니다.',
  })
  @IsOptional()
  @IsString()
  emotionalSleepInterferenceOther: string;

  // Q15
  @ApiProperty({
    example: 'music',
    description: 'preferredSleepSound',
  })
  @IsIn(['nature', 'music', 'lowFreq', 'voice', 'silence'])
  preferredSleepSound: string;

  // Q16
  @ApiProperty({
    example: 'waves',
    description: 'calmingSoundType',
  })
  @IsIn(['rain', 'waves', 'piano', 'humanVoice', 'other'])
  calmingSoundType: string;

  @ApiProperty({
    example: '',
    description: 'calmingSoundTypeOther',
  })
  @RequiredIfOther('calmingSoundType', {
    message:
      'calmingSoundType "other"일 경우 calmingSoundTypeOther 필수입니다.',
  })
  @IsOptional()
  @IsString()
  calmingSoundTypeOther: string;

  // Q17
  @ApiProperty({
    example: ['watch', 'app'],
    description: 'sleepDevicesUsed',
  })
  @IsArray()
  @IsIn(['watch', 'app', 'light', 'speaker', 'none'], { each: true })
  sleepDevicesUsed: string[];

  // Q18
  @ApiProperty({
    example: 'autoDetect',
    description: 'soundAutoOffType',
  })
  @IsIn(['fixedTime', 'autoDetect', 'manual', 'notUsed'])
  soundAutoOffType: string;

  // Q19
  @ApiProperty({
    example: 'over30min',
    description: 'timeToFallAsleep',
  })
  @IsIn(['under5min', '5to15min', '15to30min', 'over30min'])
  timeToFallAsleep: string;

  // Q20
  @ApiProperty({
    example: '1to2cups',
    description: 'caffeineIntakeLevel',
  })
  @IsIn(['none', '1to2cups', 'over3cups'])
  caffeineIntakeLevel: string;

  // Q21
  @ApiProperty({
    example: 'dailyMorning',
    description: 'exerciseFrequency',
  })
  @IsIn(['none', '2to3week', 'dailyMorning'])
  exerciseFrequency: string;

  // Q22
  @ApiProperty({
    example: 'over1hour',
    description: 'screenTimeBeforeSleep',
  })
  @IsIn(['none', 'under30min', 'over1hour'])
  screenTimeBeforeSleep: string;

  // Q23
  @ApiProperty({
    example: 'medium',
    description: 'stressLevel',
  })
  @IsIn(['high', 'medium', 'low'])
  stressLevel: string;

  // Q24
  @ApiProperty({
    example: 'stayAsleep',
    description: 'sleepGoal',
  })
  @IsIn(['deepSleep', 'fallAsleepFast', 'stayAsleep'])
  sleepGoal: string;

  // Q25
  @ApiProperty({
    example: 'voice',
    description: 'preferredFeedbackFormat',
  })
  @IsIn(['text', 'graph', 'voice'])
  preferredFeedbackFormat: string;
}
