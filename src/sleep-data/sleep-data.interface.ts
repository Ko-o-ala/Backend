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

export interface SleepDataItem {
  date: Date; // MongoDB의 Date 형식
  userID: string;
  sleepTime: SleepTime;
  Duration: Duration;
  sleepScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}
