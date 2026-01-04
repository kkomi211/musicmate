# 🎸 MUSICMATE (뮤직메이트)
> **종합 음악인을 위한 올인원 소셜 & 마켓플레이스 플랫폼**



## 🌟 프로젝트 개요
**MUSICMATE**는 음악을 사랑하는 사람들이 서로 소통하고, 밴드 멤버를 모집하며, 악기 및 악보를 거래할 수 있도록 설계된 플랫폼입니다.  
React와 Node.js 환경을 기반으로 구축되었으며, 모바일 환경에 최적화된 사용자 경험(UX)을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=flat&logo=mui&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)
![KakaoMap](https://img.shields.io/badge/KakaoMap-FFCD00?style=flat&logo=kakao&logoColor=black)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)

---

## ✨ 주요 기능 (Key Features)

### 📱 소셜 네트워크 (Social & Feed)
* **통합 피드**: 내 게시글 및 팔로우한 유저의 소식을 최신순 무한 스크롤로 제공
* **개인 피드**: 특정 유저의 프로필 및 히스토리 조회
* **상호 작용**: 좋아요, 북마크, 댓글, 태그 기능
* **스마트 검색**: 유저 닉네임, 피드 내용 기반 통합 검색 지원

### 🛍️ 마켓플레이스 & 구인 (Market & Recruit)
* **중고 장터**: 악기, 악보 등 음악 관련 물품 거래 (판매 상태 관리 기능 포함)
* **밴드 모집**: 원하는 파트, D-Day 설정을 통한 효율적인 밴드 멤버 모집
* **필터링**: 카테고리별, 판매/모집 상태별 보기 제공

### 💬 커뮤니케이션 & 유틸리티
* **실시간 메시지(DM)**: 1:1 채팅방 생성 및 대화
* **합주실 찾기**: 카카오맵 API 연동을 통한 내 주변 합주실 위치 및 정보 제공
* **마이페이지**: 개인 정보 관리, 비밀번호 변경, 활동 내역 조회

---

## 📸 주요 화면 (Screen Shots)

| 메인 피드 & 소셜 | 개인 프로필 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/8767605a-dedc-4006-be8e-f72509c28149" width="100%"> | <img src="https://github.com/user-attachments/assets/e73c0d07-c62a-4d35-bfc5-9596b52c8ceb" width="100%"> |
| **통합 피드 (Main Feed)**<br>내가 팔로우한 유저와 내 게시글을 최신순으로 보여줍니다. | **개인 피드 (Personal Feed)**<br>특정 유저의 프로필 정보와 게시물 히스토리를 조회합니다.<br>게시물 수, 팔로워/팔로잉 통계를 한눈에 볼 수 있습니다. |

| 합주실 찾기 | 악기/악보 마켓 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/516970e3-5526-4cfb-98a4-7e5b2b51e7b2" width="100%"> | <img src="https://github.com/user-attachments/assets/ac81f91c-dfcb-4090-916a-b3ba21ca4190" width="100%"> |
| **지도 기반 검색 (Map)**<br>KakaoMap API를 활용해 내 주변 합주실을 탐색합니다.<br>마커 클릭 시 상세 정보를 확인할 수 있습니다. | **중고 거래 (Marketplace)**<br>악기 및 악보를 거래하는 장터입니다.<br>카테고리 필터 및 판매 상태(판매중/완료) 관리가 가능합니다. |

| 밴드 멤버 모집 | 이벤트 & 공지 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ce78ee3d-05fc-44f6-86b8-44650057343a" width="100%"> | <img src="https://github.com/user-attachments/assets/9e625341-11de-47d3-8cbe-f0af3a6536ed" width="100%"> |
| **밴드 구인 (Recruiting)**<br>원하는 세션(파트)과 D-Day를 설정하여 멤버를 모집합니다.<br>모집 상태 필터링으로 현재 유효한 공고만 볼 수 있습니다. | **이벤트 (Events)**<br>플랫폼 내 공식 이벤트와 공지사항을 전달합니다.<br>사용자 참여를 유도하는 배너 형식의 UI를 제공합니다. |

| 실시간 소통 | 개인 정보 관리 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/848436ae-ce8b-44a0-ac7c-ea9e1b438601" width="100%"> | <img src="https://github.com/user-attachments/assets/1929dde1-c435-48c3-9b69-f38723891a6b" width="100%"> |
| **1:1 메시지 (DM)**<br>관심 있는 유저나 거래 대상과 실시간 채팅을 나눕니다.<br>채팅방 목록 관리 및 메시지 송수신 기능을 지원합니다. | **마이 페이지 (My Page)**<br>내 정보를 관리하고 비밀번호를 변경할 수 있습니다.<br>사용자 편의를 위해 직관적인 테이블 형태로 구성했습니다. |

---

## ⚙️ API Reference

### Feed Router Endpoints

| Method | Endpoint | Description | Body / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/feed/search` | 통합 검색 | `q`, `type`, `userId` |
| `GET` | `/feed/:userId/:feedCount` | 메인 피드 조회 | `userId`, `feedCount` |
| `GET` | `/feed/personal/:userId/:feedCount` | 개인 피드 조회 | `userId`, `feedCount` |
| `POST` | `/feed/personal/:userId` | 프로필 정보 조회 | `userId` |
| `PUT` | `/feed/user/update` | 프로필 수정 | `FormData` (img, data) |
| `GET` | `/feed/like/:feedNo/:userId` | 좋아요 토글 | `feedNo`, `userId` |
| `POST` | `/feed/comment` | 댓글 등록 | `feedNo`, `userId`, `content` |

*(Note: 위 목록은 Feed 관련 주요 API이며, 전체 API 문서는 프로젝트 내부 문서를 참고하세요.)*

---

## 🚀 설치 및 실행 방법 (Getting Started)

### 1. 환경 설정 (Prerequisites)
프로젝트 실행을 위해 `MySQL` 데이터베이스와 `Kakao Map API Key`가 필요합니다.

**Database Setup** `USER`, `FEED`, `FEED_IMG`, `FOLLOW`, `BOOKMARK`, `EVENT`, `BAND_BOARD`, `MESSAGE` 등의 테이블을 생성합니다. (상세 스키마는 `schema.sql` 참고)

**Kakao Map API Setup** `public/index.html` 파일 `<head>` 태그 내에 발급받은 키를 입력하세요.
```html
<script type="text/javascript" src="//[dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services](https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services)"></script>
