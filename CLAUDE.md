# movie-recommender

## 기술 스택
- React 18
- Tailwind CSS v4 (@tailwindcss/vite 방식)
- Fuse.js 7.x
- TMDB API

## 폴더 구조
```
src/
  components/
  hooks/
  utils/
```

## 금지사항
- `tailwind.config.js` 생성 금지
- TMDB API 호출 시 `api_key` 쿼리 파라미터 방식 금지
- 소스코드에 API 토큰 하드코딩 금지

## API 규칙
- TMDB 토큰은 반드시 `import.meta.env.VITE_TMDB_TOKEN` 사용
- 인증은 `Authorization: Bearer <token>` 헤더 방식 사용

## 코딩 규칙
- 컴포넌트는 함수형만 사용
- TypeScript 사용 안 함
- CSS는 Tailwind 클래스만 사용
