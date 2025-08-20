/**
 * 한국 시간대(KST) 관련 유틸리티 함수들
 */

/**
 * 현재 한국 시간을 반환합니다.
 * @returns 한국 시간 Date 객체
 */
export function getCurrentKST(): Date {
  // 한국 시간대 오프셋 (UTC+9)
  const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
  const utcTime = new Date().getTime();
  return new Date(utcTime + kstOffset);
}

/**
 * UTC 시간을 한국 시간으로 변환합니다.
 * @param utcDate UTC 시간 Date 객체
 * @returns 한국 시간 Date 객체
 */
export function convertUTCToKST(utcDate: Date): Date {
  const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
  return new Date(utcDate.getTime() + kstOffset);
}

/**
 * 한국 시간을 UTC 시간으로 변환합니다.
 * @param kstDate 한국 시간 Date 객체
 * @returns UTC 시간 Date 객체
 */
export function convertKSTToUTC(kstDate: Date): Date {
  const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
  return new Date(kstDate.getTime() - kstOffset);
}

/**
 * 날짜 문자열을 한국 시간 기준 Date 객체로 변환합니다.
 * @param dateString 'YYYY-MM-DD' 형식의 날짜 문자열
 * @returns 한국 시간 기준 Date 객체
 */
export function parseDateToKST(dateString: string): Date {
  // 한국 시간대 기준으로 날짜 생성 (00:00:00)
  const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
  const utcDate = new Date(dateString + 'T00:00:00.000Z');
  return new Date(utcDate.getTime() + kstOffset);
}

/**
 * 한국 시간 기준으로 하루의 시작과 끝 시간을 반환합니다.
 * @param date 기준 날짜
 * @returns { startOfDay: Date, endOfDay: Date }
 */
export function getKSTDayBoundaries(date: Date): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

/**
 * 한국 시간 기준으로 전날의 시작과 끝 시간을 반환합니다.
 * @param date 기준 날짜
 * @returns { startOfDay: Date, endOfDay: Date }
 */
export function getKSTPreviousDayBoundaries(date: Date): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);

  const startOfDay = new Date(previousDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(previousDate);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

/**
 * MongoDB 저장용 한국 시간을 생성합니다.
 * @returns MongoDB에 저장할 한국 시간 Date 객체
 */
export function getMongoDBKSTTime(): Date {
  return getCurrentKST();
}
