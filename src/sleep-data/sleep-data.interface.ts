export interface SleepDataItem {
  date: Date; // MongoDB의 Date 형식
  userID: string;
  startTime: string;
  endTime: string;
  segments?: { start: string; end: string }[];
  totalSleepDuration: number;
  deepSleepDuration: number;
  remSleepDuration: number;
  lightSleepDuration: number;
  awakeDuration: number;
  sleepScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}
