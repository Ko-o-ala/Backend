export interface SleepDataItem {
  date: string;
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
