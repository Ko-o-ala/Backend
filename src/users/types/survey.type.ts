export type Survey = {
  sleepLightUsage: 'off' | 'moodLight' | 'brightLight';
  lightColorTemperature: 'coolWhite' | 'neutral' | 'warmYellow' | 'unknown';
  noisePreference:
    | 'silence'
    | 'whiteNoise'
    | 'rainsound'
    | 'firesound'
    | 'nolyricssound'
    | 'yeslyricssound'
    | 'drama'
    | 'radio'
    | 'other';
  noisePreferenceOther: string;
  usualBedtime: 'before9pm' | '9to12pm' | '12to2am' | 'after2am';
  usualWakeupTime: 'before5am' | '5to7am' | '7to9am' | 'after9am';
  dayActivityType: 'indoor' | 'outdoor' | 'mixed';
  morningSunlightExposure:
    | 'under1h'
    | 'between1to3'
    | 'between3to5'
    | 'between5to7'
    | 'over7';
  napFrequency: 'daily' | '3to4perWeek' | '1to2perWeek' | 'rarely';
  napDuration: 'none' | 'under15' | '15to30' | '30to60' | 'over60';
  mostDrowsyTime:
    | 'morningWakeup'
    | 'afterLunch'
    | 'afternoon'
    | 'afterDinner'
    | 'night'
    | 'random';
  averageSleepDuration: 'under4h' | '4to6h' | '6to7h' | '7to8h' | 'over8h';
  sleepIssues: (
    | 'fallAsleepHard'
    | 'wakeOften'
    | 'wakeEarly'
    | 'daySleepy'
    | 'nightmares'
    | 'movesALot'
    | 'notRested'
    | 'useSleepingPills'
    | 'none'
  )[];
  emotionalSleepInterference: (
    | 'stress'
    | 'anxiety'
    | 'loneliness'
    | 'tension'
    | 'other'
  )[];
  emotionalSleepInterferenceOther: string;
  preferredSleepSound: 'nature' | 'music' | 'lowFreq' | 'voice' | 'silence';
  calmingSoundType: 'rain' | 'waves' | 'piano' | 'humanVoice' | 'other';
  calmingSoundTypeOther: string;
  sleepDevicesUsed: ('watch' | 'app' | 'light' | 'speaker' | 'none')[];
  timeToFallAsleep:
    | 'under5min'
    | '5to15min'
    | '15to30min'
    | 'over30min'
    | 'over1h';
  caffeineIntakeLevel: 'none' | '1to2cups' | 'over3cups' | 'over5cups';
  exerciseFrequency: 'none' | '2to3week' | 'dailyMorning';
  exerciseWhen: 'before8' | '8to12' | '12to16' | '16to20' | '20to24' | 'night';
  screenTimeBeforeSleep:
    | 'none'
    | 'under30min'
    | '30to1h'
    | '1hto2h'
    | '2hto3h'
    | 'over3h';
  stressLevel: 'high' | 'medium' | 'low';
  sleepGoal:
    | 'deepSleep'
    | 'fallAsleepFast'
    | 'stayAsleep'
    | 'wakeUpRefreshed'
    | 'comfortableSleep'
    | 'optimalEnvironment'
    | 'consistentSchedule';
  preferenceBalance: number;
};
