import { Survey } from '../../users/types/survey.type';

export interface SleepDataRatio {
  awakeRatio: number;
  deepSleepRatio: number;
  lightSleepRatio: number;
  remSleepRatio: number;
  sleepScore: number;
}

export interface SleepData {
  current: SleepDataRatio;
  previous?: SleepDataRatio;
}

export interface SoundData {
  preferredSounds: string[];
  previousRecommendations: string[];
}

export interface AlgorithmRequestData {
  userID: string;
  date: string;
  sleepData?: SleepData;
  sounds?: SoundData;
  survey: Survey;
}

export interface AlgorithmResponse {
  recommendation_text: string;
  recommended_sounds: Array<{
    filename: string;
    rank: number;
  }>;
}

export interface AvgSleepData {
  ratio: {
    awakeRatio: number;
    deepSleepRatio: number;
    lightSleepRatio: number;
    remSleepRatio: number;
  };
  sleepScore: number;
}

export interface PreviousRecommendation {
  recommended_sounds: Array<{
    filename: string;
    rank: number;
  }>;
}
