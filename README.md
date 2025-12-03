🎸 MUSICMATE
종합 음악인을 위한 SNS & 마켓플레이스 플랫폼
🌟 프로젝트 소개

MUSICMATE는 음악을 사랑하는 사람들이 서로 소통하고, 밴드 멤버를 모집하며, 악기/악보를 거래할 수 있는 올인원 소셜 + 마켓플레이스 플랫폼입니다.
React / Node.js / MySQL 기반으로 제작되었으며, 모바일 UX에 최적화되어 있습니다.

✨ 주요 기능
🔹 소셜 & 피드 기능
기능	설명
통합 피드	내 글 + 팔로우한 사용자 글 최신순 조회 (무한스크롤)
개인 피드	특정 사용자의 프로필 + 게시글만 조회
상호작용	좋아요, 북마크, 댓글, 닉네임 클릭하여 개인 피드 이동
검색	사용자 / 피드 통합 검색
🔹 마이페이지 기능
기능	설명
정보 조회/수정	아이디, 닉네임, 악기, 비밀번호 변경
프로필 사진 수정	이미지 업로드 및 변경
🔹 거래 / 밴드 모집 기능
기능	설명
중고 장터	악기/악보 거래, 카테고리 필터, 내 글 보기
거래 상세	이미지 슬라이드, 판매 상태 변경, 삭제(본인 글만)
밴드 모집	모집 파트, D-DAY, 모집 상태 필터링
🔹 커뮤니케이션 기능
기능	설명
DM (1:1 메시지)	실시간 채팅, 목록 조회, 채팅방 이동
합주실 찾기	카카오맵 기반 합주실 위치 검색 및 마커 표시
🛠 기술 스택
Frontend

React (SPA, Hooks)

Material UI (MUI)

Axios / Fetch API

react-router-dom

Kakao Map SDK (지도)

Daum Postcode API (주소 검색)

Backend

Node.js + Express

MySQL

bcrypt (비밀번호 암호화)

JWT (토큰 인증)

Multer (파일 업로드)

⚙️ 서버 API 엔드포인트 (Feed Router 기준)
분류	메소드	엔드포인트	요청 데이터	설명
통합 검색	POST	/feed/search	q, type, userId	통합 검색 (사용자/피드)
피드 목록	GET	/feed/:userId/:feedCount	Params	메인 피드 조회
개인 피드	GET	/feed/personal/:userId/:feedCount	Params	특정 사용자 게시글
프로필 정보	POST	/feed/personal/:userId	Params	프로필 + 통계
프로필 수정	PUT	/feed/user/update	FormData	닉네임, 악기, 프로필 이미지 업데이트
좋아요	GET	/feed/like/:feedNo/:userId	Params	좋아요 토글
북마크	GET	/feed/bookmark/:feedNo/:userId	Params	북마크 토글
북마크 목록	GET	/feed/bookmark/list/:userId/:feedCount	Params	북마크 목록 조회
팔로우 확인	GET	/feed/checkFollow/:myId/:targetId	Params	팔로우 여부 조회
팔로우 토글	POST	/feed/follow	myId, targetId	팔로우/언팔로우
댓글 조회	GET	/feed/comment/:feedNo	Params	댓글 조회
댓글 등록	POST	/feed/comment	feedNo, userId, content	댓글 작성
댓글 삭제	DELETE	/feed/comment/:commentNo	Params	댓글 삭제
🚀 설치 및 실행 방법
1️⃣ MySQL & 환경 설정

USER, FEED, FEED_IMG, FOLLOW, BOOKMARK, EVENT, BAND_BOARD, BAND_IMG,
ENSEMBLE_ROOM, MESSAGE, CHAT_ROOM, CHAT_MESSAGE, ALERT 테이블 생성
(스키마는 프로젝트 파일 참고)

Kakao Map API 키 등록

<!-- public/index.html의 <head> 안에 추가 -->
<script type="text/javascript" 
src="//dapi.kakao.com/v2/maps/sdk.js?appkey=발급받은_JavaScript_키&libraries=services"></script>

2️⃣ 서버 실행 (Node.js)
# 1. 의존성 설치
npm install express mysql bcrypt jsonwebtoken multer

# 2. 서버 실행
node server.js

3️⃣ 클라이언트 실행 (React)
# 1. React 라이브러리 설치
npm install react-router-dom @mui/material @emotion/react @emotion/styled

# 2. 개발 서버 실행
npm start
