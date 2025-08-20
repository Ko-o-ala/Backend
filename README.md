## introduce

2025 한이음 드림업 <프로젝트 : AI 기반 개인 맞춤형 수면 유도 사운드 추천 플랫폼 및 수면 로봇 개발>의 매엔 백엔드 서버입니다.

## ⚠️ 시간대 설정 주의사항

**중요**: 이 프로젝트는 한국 시간대(KST, UTC+9)로 설정되어 있습니다.

### 시간대 설정이 적용된 부분:

- **MongoDB 스키마**: `createdAt`, `updatedAt` 필드가 한국 시간으로 저장됨 (pre-save 미들웨어 사용)
- **Date 객체 생성**: 모든 날짜 처리가 한국 시간대 기준으로 동작
- **서버 실행**: `TZ=Asia/Seoul` 환경변수로 실행됨
- **시간대 계산**: UTC+9 오프셋을 사용한 정확한 한국 시간대 처리

### 시간대 관련 유틸리티 함수:

- `src/common/utils/date.util.ts`에 한국 시간대 처리 함수들이 포함됨
- `parseDateToKST()`, `getKSTDayBoundaries()`, `getMongoDBKSTTime()` 등 사용 가능
- **중요**: MongoDB 저장 시 `getMongoDBKSTTime()` 함수를 사용하여 정확한 한국 시간 저장

### 실행 시 주의사항:

```bash
# 개발 모드 실행 (한국 시간대 자동 설정)
npm run start:dev

# 프로덕션 모드 실행 (한국 시간대 자동 설정)
npm run start:prod
```

## structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Sleep Robot   │    │   External      │
│   (Mobile App)  │◄──►│   (Hardware)    │◄──►│   LLM Services  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌───────────────────────────────────────────────────────────────┐
│                    Main Backend Server                        │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    App Module                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ Auth Module │ │Users Module │ │Recommend Sound  │   │   │
│  │  │             │ │             │ │    Module       │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              Sleep Data Module                  │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                 LLM Module                      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   JWT Token     │    │   Swagger       │
│   Database      │    │   Authentication│    │   Documentation │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## description

### **Auth Module** (`/auth`)

- **역할**: 사용자 인증 및 JWT 토큰 관리
- **주요 기능**: 로그인, JWT 토큰 발급 및 검증
- **상호작용**:
  - Frontend (Mobile App)와 JWT 토큰 기반 인증
  - Users Module과 연동하여 사용자 정보 검증
  - 모든 보호된 API 엔드포인트에 인증 제공

### **Users Module** (`/users`)

- **역할**: 사용자 계정 관리 및 프로필 정보 처리
- **주요 기능**: 회원가입, 로그인, 프로필 수정, 설문조사 데이터 관리, 선호 사운드 순위 관리
- **상호작용**:
  - Frontend (Mobile App)와 사용자 계정 관련 API 제공
  - Auth Module과 연동하여 인증된 사용자 정보 관리
  - Recommend Sound Module에 사용자 설문조사 데이터 제공

### **Recommend Sound Module** (`/recommend-sound`)

- **역할**: AI 기반 개인 맞춤형 수면 유도 사운드 추천
- **주요 기능**: 추천 알고리즘 실행, 추천 결과 저장 및 조회
- **상호작용**:
  - Frontend (Mobile App)와 추천 결과 제공
  - Users Module에서 사용자 설문조사 데이터 수집
  - Sleep Data Module에서 생체 데이터 수집
  - External AI Services와 연동하여 추천 알고리즘 실행

### **Sleep Data Module** (`/sleep-data`)

- **역할**: 사용자의 수면 생체 데이터 관리 및 분석
- **주요 기능**: 수면 데이터 저장, 월별 평균 수면 데이터 조회, 특정 날짜 수면 데이터 조회
- **상호작용**:
  - Sleep Robot (Hardware)에서 생체 데이터 수신
  - Frontend (Mobile App)에 수면 데이터 분석 결과 제공
  - Recommend Sound Module에 생체 데이터 제공하여 추천 알고리즘에 활용

### **LLM Module** (`/llm`)

- **역할**: LLM 서버와의 연동을 위한 JWT 토큰 검증 및 생체 데이터 제공
- **주요 기능**:
  - JWT 토큰 검증 및 사용자 정보 반환
  - 사용자별 전체 생체 데이터 압축 전송
- **상호작용**:
  - External LLM Services에서 JWT 토큰 검증 요청
  - Auth Module을 통한 토큰 검증
  - Sleep Data Module에서 사용자별 전체 생체 데이터 조회
  - 압축된 생체 데이터를 LLM 서버에 제공

#### **API 엔드포인트**

- **POST** `/llm/validate-token/get/sleep-data`
  - JWT 토큰 검증과 생체 데이터 조회를 한 번의 API 호출로 처리
  - Bearer 토큰을 Authorization 헤더에 포함하여 요청
  - **선택적 압축**: 생체 데이터만 gzip으로 압축, 사용자 정보는 압축하지 않음
  - **압축 확인**: 응답 헤더와 \_compressionInfo 필드로 압축 상태 확인 가능
  - Swagger 문서화 완료 (DTO 포함)

#### **압축 기능 상세**

- **압축 대상**: `biometricData` 필드만 선택적으로 압축
- **압축 방식**: gzip (Node.js 내장 zlib 모듈 사용)
- **데이터 전달**: 압축된 데이터만 전달 (원본 데이터 제거)
- **압축 확인 방법**:
  - `_compressionInfo.status`: 'success' 또는 'failed'
  - `_compressionInfo.message`: 압축 성공/실패 메시지 (✅/❌ 표시)
  - `_compressionInfo` 필드에 압축 정보 포함
- **장점**:
  - 대용량 생체 데이터의 효율적인 전송
  - 사용자 정보는 즉시 읽을 수 있음
  - 압축 실패 시 자동으로 원본 데이터 반환
  - 압축 상태를 명확하게 확인 가능

### **Common Infrastructure**

- **Middleware**: 로깅, CORS, 요청/응답 처리
- **Guards**: JWT 인증, 내부 API 키 검증
- **Interceptors**: 성공 응답 표준화
- **Filters**: HTTP 예외 처리
- **Validation**: DTO 기반 데이터 검증
- **Swagger**: API 문서화 및 테스트 인터페이스

### **데이터 흐름**

1. **사용자 등록/로그인**: Frontend → Auth Module → Users Module → MongoDB
2. **수면 데이터 수집**: Sleep Robot → Sleep Data Module → MongoDB
3. **사운드 추천**: Frontend → Recommend Sound Module → AI Services → MongoDB
4. **데이터 조회**: Frontend → 각 Module → MongoDB → Frontend

### **외부 연동**

- **MongoDB**: 메인 데이터베이스
- **External AI Services**: 추천 알고리즘 실행
- **JWT**: 보안 인증
- **Swagger**: API 문서화 및 테스트
