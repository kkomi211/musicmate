# 🎸 MUSICMATE: 종합 음악인을 위한 SNS 및 마켓플레이스 플랫폼

## 🌟 프로젝트 개요

MUSICMATE는 음악을 사랑하는 사람들이 서로 소통하고, 밴드 멤버를 모집하며, 악기 및 악보를 거래할 수 있도록 설계된 종합 소셜/마켓플레이스 플랫폼입니다. React와 Node.js (Express, MySQL) 환경을 기반으로 구축되었으며, 모바일 최적화된 UX를 제공합니다.

## ✨ 주요 기능

|분류|내용|설명|
|-----|-----|-----|
|소셜/피드|통합 피드|내 게시글 및 팔로우한 사용자의 게시글을 최신순으로 조회 (무한 스크롤 구현)|
||개인 피드|특정 사용자(본인/타인)의 프로필 정보 및 작성 글만 조회|
||상호 작용|좋아요, 북마크, 댓글 작성 및 삭제, 닉네임 클릭 시 개인 피드 이동|
||검색|검색어와 조건(사용자, 피드)에 따라 통합 검색 결과 제공|
|마이페이지|정보 조회/수정|사용자 아이디, 닉네임, 사용 악기 등 정보 조회 및 비밀번호 변경 (테이블 형식)|
|거래/모집|중고 장터|악기/악보/기타 거래 목록을 그리드 형태로 제공 (카테고리, 내 글 보기, 더보기 필터링)|
||거래 상세|상품 이미지 슬라이드, 판매 상태(판매 중/완료) 토글, 판매글 삭제 기능 (본인 작성 글에 한함)|
||밴드 모집|밴드 멤버 모집글 목록 제공 (모집 파트, D-Day, 상태 필터링 포함)|
|커뮤니케이션|메시지 (DM)|1:1 채팅방 진입 및 메시지 송수신 (목록 조회 및 채팅방 구현)|
||합주실 찾기|카카오맵 API를 활용한 지도 기반 합주실 위치 검색 및 마커 표시|

## 🛠️ 기술 스택

### 클라이언트 (Frontend)

* React (SPA, Hooks)
* Material UI (MUI): 반응형 및 컴포넌트 디자인
* Axios / Fetch API: 서버 통신
* react-router-dom: 페이지 라우팅
* 카카오맵 SDK: 합주실 위치 지도 연동
* 다음 우편번호 API: 주소 검색

### 서버 (Backend) & 데이터베이스

* Node.js & Express: RESTful API 구축
* MySQL: 관계형 데이터베이스
* bcrypt: 비밀번호 단방향 암호화
* jsonwebtoken (JWT): 사용자 인증 및 토큰 발급
* Multer: 파일 업로드 처리

## ⚙️ 서버 및 API 엔드포인트 (Feed 라우터 기준)

| 기능 분류 | 메소드 | 엔드포인트 | 요청 데이터 (Body) | 설명 | 
| :--- | :--- | :--- | :--- | :--- |
| **통합 검색** | `POST` | `/feed/search` | `q`, `type` (user/feed), `userId` | 사용자(ID/닉네임) 또는 피드(내용) 검색 결과 조회 |
| **피드 목록** | `GET` | `/feed/:userId/:feedCount` | (Params) | 메인 피드 (내 글 + 팔로잉 글) 목록 조회 |
| **개인 피드** | `GET` | `/feed/personal/:userId/:feedCount` | (Params) | 특정 사용자의 글만 조회 |
| **프로필 정보** | `POST` | `/feed/personal/:userId` | (Params) | 유저 상세 정보 및 통계 조회 (게시물 수, 팔로워 등) |
| **프로필 수정** | `PUT` | `/feed/user/update` | `userId`, `nickname`, `instrument`, `file` (FormData) | 닉네임, 악기 정보 및 프로필 사진 업데이트 |
| **좋아요 토글** | `GET` | `/feed/like/:feedNo/:userId` | (Params) | 게시글에 좋아요 설정 또는 해제 |
| **북마크 토글** | `GET` | `/feed/bookmark/:feedNo/:userId` | (Params) | 게시글에 북마크 설정 또는 해제 |
| **북마크 목록** | `GET` | `/feed/bookmark/list/:userId/:feedCount` | (Params) | 사용자가 북마크한 피드 목록 조회 |
| **팔로우 상태 확인** | `GET` | `/feed/checkFollow/:myId/:targetId` | (Params) | 특정 사용자의 팔로우 상태 확인 |
| **팔로우 토글** | `POST` | `/feed/follow` | `myId`, `targetId` | 팔로우/언팔로우 처리 |
| **댓글 조회** | `GET` | `/feed/comment/:feedNo` | (Params) | 특정 피드의 댓글 및 이미지 목록 조회 |
| **댓글 등록** | `POST` | `/feed/comment` | `feedNo`, `userId`, `content` | 댓글을 작성하고 DB에 저장 |
| **댓글 삭제** | `DELETE` | `/feed/comment/:commentNo` | (Params) | 특정 댓글 삭제 |


## 🚀 설치 및 실행 방법 (로컬 환경)

# 1. 환경 설정 및 DB 준비

MySQL DB 설정: USER, FEED, FEED_IMG, FOLLOW, BOOKMARK, EVENT, BAND_BOARD, BAND_IMG, ENSEMBLE_ROOM, MESSAGE, CHAT_ROOM, CHAT_MESSAGE, ALERT 테이블을 생성합니다. (스키마는 프로젝트 파일 참고)

카카오맵 API 키 설정: public/index.html 파일에 JavaScript 키를 등록합니다.

<!-- public/index.html의 <head> 태그 안에 추가 -->
<script type="text/javascript" src="//[dapi.kakao.com/v2/maps/sdk.js?appkey=발급받은_JavaScript_키&libraries=services](https://dapi.kakao.com/v2/maps/sdk.js?appkey=발급받은_JavaScript_키&libraries=services)"></script>


# 2. 서버 실행 (Node.js)

### 1. 의존성 설치
npm install express mysql bcrypt jsonwebtoken multer

### 2. 서버 파일 실행 (예시: server.js 또는 app.js)
node server.js


# 3. 클라이언트 실행 (React)

### 1. 필요한 React 라이브러리 설치
npm install react-router-dom @mui/material @emotion/react @emotion/styled

### 2. 개발 서버 실행
npm start 
