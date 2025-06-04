# 메모 앱 (Memo App)

React, TypeScript, Vite를 사용하여 개발된 간단한 메모 애플리케이션입니다.

## 주요 기능

- 메모 작성, 수정, 삭제
- 메모 목록 조회
- 반응형 디자인

## 기술 스택

- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.5
- ESLint 9.25.0

## 시작하기

### 필수 조건

- Node.js (최신 LTS 버전 권장)
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드

```bash
npm run build
```

### 린트 검사

```bash
npm run lint
```

### 타입 체크

```bash
npm run typecheck
```

## 프로젝트 구조

```
memo-app/
├── src/
│   ├── components/     # React 컴포넌트
│   │   ├── MemoForm.tsx
│   │   └── MemoList.tsx
│   ├── types/         # TypeScript 타입 정의
│   ├── assets/        # 정적 자원
│   ├── App.tsx        # 메인 애플리케이션 컴포넌트
│   └── main.tsx       # 애플리케이션 진입점
├── public/            # 정적 파일
└── package.json       # 프로젝트 설정 및 의존성
```

## 라이선스

MIT
