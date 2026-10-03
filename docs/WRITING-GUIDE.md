# 글쓰기 가이드 — 마크다운 ↔ 디자인 매핑, 그리고 두 가지 운영 방식

## 1. 지금 글은 이렇게 씁니다 (마크다운 파일)

`_posts/YYYY-MM-DD-slug.md` 파일 하나가 글 하나입니다. 파일명의 날짜가 글 날짜이자 주소(`/YYYY-MM-DD/slug/`)가 됩니다.

```yaml
---
title: 글 제목
subtitle: 카드와 아티클 상단에 보이는 한 줄 요약
category: Full-Stack    # 기획 | Full-Stack | AI/ML | Life  (_config.yml 의 categories_list)
tags: [Audio, Web]      # 앞의 # 은 자동
image: /assets/images/posts/foo.png   # 비우면 회색 플레이스홀더
---
본문은 여기부터 마크다운.
```

### 머리말(front matter) → 어디에 보이나

| 필드 | 홈 카드 (Post Card) | 아티클 페이지 (Article Meta) | 그 외 |
|---|---|---|---|
| `title` | 제목 22/700 검정 | 제목 32/700 (모바일 23) | 브라우저 탭, RSS, 검색 대상 |
| `subtitle` | 요약 16/500 | 부제 22/400 | 검색 대상, SEO description |
| `category` | 왼쪽 위 회색 라벨 | 보라색 라벨 (Poppins 18/600) | 카테고리 필터 칩 |
| `tags` | 흰 pill 태그 `#Tag` | 본문 끝 보라 글자 태그 | 태그 클릭 → 홈 `?tag=` 필터, 검색 대상 |
| `image` | 468×308 썸네일 (cover, hover 확대) | 상단 풀블리드 360px (contain) | 비우면 `--bg-surface` 회색 |
| 파일명 날짜 | `2026-08-23` (회색) | `2026.08.23` (Poppins) | URL |

## 2. 본문 마크다운 ↔ 디자인 매핑

Figma Components 프레임의 이름과 CSS 선택자를 같이 적었습니다. 글을 쓰면서 "이건 어떻게 보이지?"를 찾을 때 이 표를 보면 됩니다.

| 마크다운 | 화면 | Figma 컴포넌트 / 텍스트 스타일 | CSS |
|---|---|---|---|
| `## 소제목` | 23px/800, 위 여백 48+30 · **목차 1단계** | Body/H2 | `.post__content h2` |
| `### 소제목` | 20px/700 · **목차 2단계(회색)** | Body/H3 | `.post__content h3` |
| `#### 소제목`, `##### 소제목` | 17px/700, 목차에 안 들어감 | Body/H5 | `.post__content h4, h5` |
| `###### 한 줄 메모` | 가운데 정렬 회색 17px (글 끝 각주·면책용) | Body/H6 Note | `.post__content h6` |
| 보통 단락 | 16px / 행간 1.8 / 자간 −0.9%, 단락 간격 10 | Body/Paragraph | `.post__content p` |
| `**굵게**` | 같은 크기, 700 | — | `strong` |
| `[텍스트](url)` | 글자색 유지 + 1px 보라 밑줄, hover 보라 글자 | (Interaction 03 본문 링크) | `.post__content a` |
| `` `코드` `` | 보라 글자 + 연회색(#F6F9FC) 배경 pill | Inline Code | `.post__content code` |
| ```` ```python ```` … ```` ``` ```` | 연회색 박스, 1px 테두리, 13px 모노, 문법 색상 | Code Block | `.post__content pre` |
| `> 인용` | 왼쪽 4px 회색 선 + 회색 글자 | Blockquote | `.post__content blockquote` |
| `- 항목` | 6px 회색 점 불릿, 들여쓰기 10 | (Body elements 불릿) | `.post__content ul li` |
| `1. 항목` | 숫자 목록 | — | `.post__content ol li` |
| `![대체텍스트](경로)` | 폭 100%, 라운드 8 | Figure (image) | `.post__content img` |
| 이미지 바로 다음 줄 `*캡션*` | 가운데 회색 14px 캡션, 아래 여백 40 | Figure (caption) | `.post__content img + em` |
| `\| 표 \|` (GFM 표) | 검정 머리행 + 흰 글자, 셀 #555, 첫 열 굵게 | Table | `.post__content table` |
| `---` | 얇은 회색 선, 위아래 20 | — | `.post__content hr` |
| `<details>` 등 HTML | 그대로 삽입되지만 스타일 보장 없음 | — | — |

규칙 몇 가지:

- 본문에서 `#`(h1)은 쓰지 않습니다. 제목은 머리말 `title` 하나뿐입니다.
- 목차는 `##`/`###`만 모읍니다. `##` 없이 `###`만 쓰면 1단계로 올라갑니다.
- 이미지는 `assets/images/posts/글-slug/파일명.png`에 두는 것을 권장합니다 (글마다 폴더).
- 코드블록 언어 이름(`python`, `js`, `bash`, `yaml` …)을 쓰면 색상이 입혀집니다.
- 모든 요소가 들어 있는 확인용 글이 `_drafts/markdown-style-guide.md`에 있습니다. `bundle exec jekyll serve --drafts`로 보면 됩니다.

## 3. 운영 방식 A — 마크다운 파일로 쓰기 (지금 방식 + 보강)

흐름: 파일 작성 → `bundle exec jekyll serve --livereload`로 실제 디자인 그대로 미리보기 → `git push` → GitHub Actions가 배포.

**이 방식으로 확정했고, 아래가 갖춰져 있습니다.**

1. **새 글 생성 스크립트** — `ruby scripts/new-post.rb "제목" [--slug x] [--category Research] [--tags A,B] [--subtitle "…"] [--template 이름] [--draft]`. 날짜·slug·머리말이 채워진 파일과 `assets/images/posts/slug/` 폴더를 만듭니다.
   파일은 `_templates/post.md` 를 채워서 만듭니다. 템플릿 머리말에 **제목 · 소제목 · 카테고리 · 해시태그 · 대표 이미지를 어느 줄에 적는지** 주석으로 적혀 있고, 날짜와 주소는 파일명에서 온다는 것도 함께 적혀 있습니다. 손으로 만들 때는 이 파일을 복사해 `{{...}}` 자리를 채우면 됩니다. 머리말 안의 `#` 주석은 YAML 주석이라 화면에 나오지 않습니다. 템플릿을 고치려면 해당 파일만 편집하면 됩니다.
2. **초안 폴더** — `--draft` 로 `_drafts/slug.md` 에 생성, `bundle exec jekyll serve --livereload --drafts` 로만 보임. 완성되면 `ruby scripts/publish-draft.rb slug` 로 오늘 날짜의 `_posts/` 파일로 이동.
3. **스타일 확인 글** — `_drafts/markdown-style-guide.md`. 위 표의 모든 요소가 들어 있어 디자인을 바꿀 때 이 글만 열어 보면 됩니다.
4. **에디터 미리보기** — VS Code 의 Markdown Preview(Ctrl+Shift+V) 로 구조를 보고, 실제 디자인은 serve 로 확인.
5. **모바일·외부에서 쓸 때** — github.com 저장소에서 `.` 키를 누르면 열리는 웹 VS Code(github.dev)로 파일을 만들고 바로 커밋. 서버·설정 없음.

하루 흐름: `new-post.rb --draft` → 쓰면서 `serve --drafts` 로 확인 → `publish-draft.rb` → `git push` → 1~2분 뒤 배포.

## 4. 운영 방식 B — 웹에서 "글쓰기" 버튼 + 실시간 미리보기

GitHub Pages는 정적 호스팅이라 글을 저장할 서버가 없습니다. 그래서 "저장"은 결국 **GitHub 저장소에 커밋**하는 일이 되고, 두 갈래가 있습니다.

### B-1. 직접 만드는 에디터 페이지 (`/write/`)

- 왼쪽 마크다운 입력, 오른쪽 미리보기. 미리보기는 `marked`(마크다운 → HTML) + `highlight.js`를 브라우저에서 돌리고 **블로그의 `main.css`를 그대로 적용**하므로 실제와 거의 같은 화면이 나옵니다.
- 머리말은 폼(제목·요약·카테고리·태그·대표 이미지)으로 입력.
- 저장: ① `.md` 파일 다운로드(가장 단순) ② GitHub REST API로 `_posts/`에 커밋(개인 토큰을 브라우저 localStorage에 저장, 본인만 사용) → 1~2분 뒤 Actions 배포.
- 이미지: 붙여넣기 → GitHub API로 `assets/images/posts/`에 업로드 후 경로 삽입.
- 글쓰기 버튼은 헤더에 두되 토큰이 없으면 숨김(방문자에게는 안 보임).
- 작업량: 에디터 페이지 1개 + JS 300~500줄, 이틀 정도. Jekyll 빌드와 무관하게 정적 페이지 하나로 끝납니다.

### B-2. 기성 CMS 붙이기

- **Decap CMS / Sveltia CMS**: `/admin/`에 올리는 정적 관리 화면. 글 목록·편집·이미지 업로드·초안 워크플로가 이미 있음. GitHub 로그인에 **OAuth 프록시**(Cloudflare Worker 등 아주 작은 서버)가 필요. 미리보기는 기본이 "비슷한" 수준이라 블로그 스타일로 맞추려면 프리뷰 템플릿을 따로 등록해야 함.
- **Pages CMS**(pagescms.org): 서버 없이 호스팅된 UI로 GitHub 저장소를 편집. 설정 파일 하나로 시작하지만 미리보기는 일반 마크다운 수준.
- 작업량: 설정 반나절 + 프록시(Decap) 1~2시간. 대신 유지보수는 남의 도구에 맡기는 셈.

## 5. 트레이드오프

| 기준 | A 마크다운 파일 | B-1 직접 만든 에디터 | B-2 기성 CMS |
|---|---|---|---|
| 준비 비용 | 없음 (스크립트 정도) | 1~2일 개발 | 반나절 설정 + OAuth 프록시 |
| 미리보기 정확도 | 로컬 serve는 **완전 동일** | 거의 동일 (같은 CSS, 클라이언트 렌더) | 기본은 대략적, 커스텀하면 비슷 |
| 어디서든 쓰기 | 로컬 Ruby 필요 (대안: github.dev) | 브라우저만 있으면 됨 | 브라우저만 있으면 됨 |
| 이미지 처리 | 파일 복사 | 업로드 코드 직접 구현 | 내장 |
| 보안 | 걱정 없음 | 브라우저에 GitHub 토큰 보관 (유출 시 저장소 쓰기 권한) | OAuth, 비교적 안전 |
| 버전 관리·충돌 | git 그대로 | 커밋 단위로 남지만 동시 편집 보호 없음 | 커밋 단위, 초안 브랜치 지원 |
| 디자인 변경 시 | CSS만 고치면 끝 | 에디터 미리보기도 같은 CSS라 자동 반영 | 프리뷰 템플릿 재작업 |
| 발행 지연 | 푸시 후 1~2분 | 커밋 후 1~2분 | 커밋 후 1~2분 |
| 실패 지점 | 거의 없음 | 내가 만든 코드의 버그, 토큰 만료 | 외부 서비스·프록시 장애 |
| 데이터 잠금 | 없음 | 없음 (결국 .md) | 없음 (결국 .md) |

## 6. 추천 순서

1. **지금은 A로 간다.** 스타일 확인 초안 + 새 글 스크립트만 붙이면 글쓰기 자체는 막힘이 없습니다. 모든 B도 결국 `.md` 파일을 커밋하는 것이라 나중에 얹어도 됩니다.
2. 밖에서·모바일에서 쓰는 일이 잦아지면 **B-1**을 붙입니다. 블로그 CSS를 그대로 쓰는 미리보기가 B의 핵심 가치인데, 직접 만든 페이지가 그걸 가장 정확하게 줍니다. 저장은 처음엔 "파일 다운로드"로 시작하고, 토큰 보관이 괜찮다 싶으면 GitHub 커밋을 추가합니다.
3. 이미지가 많아지고 초안 관리가 번거로워지면 그때 **B-2(Sveltia/Decap)**를 검토합니다.
