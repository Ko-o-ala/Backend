import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
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
  @IsIn([
    'silence',
    'whiteNoise',
    'rainsound',
    'firesound',
    'nolyricssound',
    'yeslyricssound',
    'drama',
    'radio',
    'other',
  ])
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
  @IsIn(['under1h', 'between1to3', 'between3to5', 'between5to7', 'over7'])
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
  @IsIn(['none', 'under15', '15to30', '30to60', 'over60'])
  napDuration: string;

  // Q11
  @ApiProperty({
    example: 'afternoon',
    description: 'mostDrowsyTime',
  })
  @IsIn([
    'morningWakeup',
    'afterLunch',
    'afternoon',
    'afterDinner',
    'night',
    'random',
  ])
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
      'notRested',
      'useSleepingPills',
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
    example: '0.6',
    description: 'preferenceBalance',
  })
  @IsNumber()
  preferenceBalance: number;

  // Q18
  @ApiProperty({
    example: ['watch', 'app'],
    description: 'sleepDevicesUsed',
  })
  @IsArray()
  @IsIn(['watch', 'app', 'light', 'speaker', 'none'], { each: true })
  sleepDevicesUsed: string[];

  // Q19
  @ApiProperty({
    example: 'over30min',
    description: 'timeToFallAsleep',
  })
  @IsIn(['under5min', '5to15min', '15to30min', 'over30min', 'over1h'])
  timeToFallAsleep: string;

  // Q20
  @ApiProperty({
    example: '1to2cups',
    description: 'caffeineIntakeLevel',
  })
  @IsIn(['none', '1to2cups', 'over3cups', 'over5cups'])
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
    example: '8to12',
    description: 'exerciseWhen',
  })
  @IsIn(['before8', '8to12', '12to16', '16to20', '20to24', 'night'])
  exerciseWhen: string;

  // Q23
  @ApiProperty({
    example: 'under30min',
    description: 'screenTimeBeforeSleep',
  })
  @IsIn(['none', 'under30min', '30to1h', '1hto2h', '2hto3h', 'over3h'])
  screenTimeBeforeSleep: string;

  // Q24
  @ApiProperty({
    example: 'medium',
    description: 'stressLevel',
  })
  @IsIn(['high', 'medium', 'low'])
  stressLevel: string;

  // Q25
  @ApiProperty({
    example: 'fallAsleepFast',
    description: 'sleepGoal',
  })
  @IsIn([
    'deepSleep',
    'fallAsleepFast',
    'stayAsleep',
    'wakeUpRefreshed',
    'comfortableSleep',
    'optimalEnvironment',
    'consistentSchedule',
  ])
  sleepGoal: string;
}
