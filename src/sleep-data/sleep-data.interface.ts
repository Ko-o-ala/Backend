export interface SleepTime {
  startTime: string;
  endTime: string;
}

export interface Duration {
  totalSleepDuration: number;
  deepSleepDuration: number;
  remSleepDuration: number;
  lightSleepDuration: number;
  awakeDuration: number;
}

export interface Segment {
  startTime: string;
  endTime: string;
  stage: 'rem' | 'awake' | 'deep' | 'light';
}

export interface SleepDataItem {
  date: Date; // MongoDB의 Date 형식
  userID: string;
  sleepTime: SleepTime;
  Duration: Duration;
  segments: Segment[];
  sleepScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}
