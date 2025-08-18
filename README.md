## introduce

2025 한이음 드림업 <프로젝트 : AI 기반 개인 맞춤형 수면 유도 사운드 추천 플랫폼 및 수면 로봇 개발>의 매엔 백엔드 서버입니다.

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
