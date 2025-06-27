# AI Input Assistant

입력창에 AI 추천 및 요약 기능을 제공하는 Chrome 확장 프로그램 및 LLM API 서버(MVP)

## 프로젝트 구조

```
ai-input-extension/
├── manifest.json           # Chrome 확장 프로그램 매니페스트
├── content-script.ts       # 입력창 감지/추천/요약 UI 삽입 스크립트
├── background.js           # MV3 백그라운드 서비스 워커
├── types.ts                # 공통 타입 정의
├── server/                 # (서버 코드: Next.js API)
│   ├── pages/api/suggest.ts
│   ├── pages/api/summarize.ts
│   ├── lib/llm.ts
│   ├── lib/validation.ts
│   └── types/
└── ...
```

## 개발 및 실행 방법

### 1. 확장 프로그램

- `manifest.json`, `content-script.ts` 등 빌드 후 Chrome 확장 프로그램으로 로드
- 서버 API(`localhost:3000`)가 실행 중이어야 추천/요약 기능 정상 동작

### 2. 서버 (Next.js)

- `server/` 디렉토리에서 Next.js 프로젝트로 실행
- OpenAI API 키 등 환경변수 필요

```bash
cd server
npm install
npm run dev
```

## TODO (MVP)

- [x] 입력창 감지 및 추천/요약 UI 삽입
- [x] Tab 키 추천 반영, 요약 버튼 동작
- [ ] 서버 API: /api/suggest, /api/summarize (OpenAI 연동)
- [ ] 에러 처리, 타입/스키마 검증(Zod)
- [ ] 설정 UI, 고도화
