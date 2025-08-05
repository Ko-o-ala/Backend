export interface SleepDataItem {
  date: string; // -> 이거 Date로 바꿔야됨. mongoDB의.
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
