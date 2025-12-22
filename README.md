# 🎄 GatherTree (Frontend)

여러 사람이 함께 크리스마스 트리를 꾸미는 웹 서비스 **GatherTree**의 프론트엔드 레포지토리입니다.

로그인 없이 누구나 참여 링크를 통해 트리 꾸미기에 참여할 수 있습니다.

---

## 🌟 소개

GatherTree는 트리를 선택하거나 직접 그린 뒤 친구들과 함께 장식을 추가해 하나의 트리를 완성하는 인터랙티브 웹 서비스입니다.

HTML5 Canvas를 활용해 장식을 그릴 수 있으며 여러 사용자의 장식은 하나의 트리 이미지로 합성되어 렌더링됩니다.

---

## ✨ 주요 기능

- 캔버스에 주어진 트리 사용하거나 트리 그리기
- 트리 수정하기
- 캔버스를 이용한 장식 그리기
- 장식 위치 계산 및 트리 배치
- 여러 장식을 합성하여 하나의 트리 이미지로 렌더링
- 참여 링크를 통한 트리 공유
- 완성된 트리 AI 평가

---

## 🛠 기술 스택

- React
- Vite
- JavaScript
- HTML5 Canvas
- Axios
- Neo CSS (NES.css)

---

## 📁 프로젝트 구조

```text
src/
- assets/       # 이미지 리소스
- components/   # 공통 컴포넌트
- lib/          # 장식 위치 계산 및 트리 배치 로직
- pages/        # 라우팅 페이지
```

---

## 🚀 실행 방법

```
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```
http://localhost:5173
```

---

🌍 배포 주소

[GatherTree (Pixel UI)](https://beour.store)
