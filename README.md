# 40404 테크블로그

올리브영 테크블로그의 레이아웃·타이포·인터랙션 패턴을 따르고, 키 컬러만 보라(#8232D2)로 바꾼 Jekyll 블로그입니다.
디자인 원본과 컴포넌트는 Figma 파일 **Github-Blog → Page 1 → "블로그 디자인"** 프레임에 있습니다.

## 로컬에서 보기

```bash
cd E:\Github-Blog
bundle install
bundle exec jekyll serve --livereload
```

브라우저에서 [http://127.0.0.1:4000](http://127.0.0.1:4000) 을 열면 됩니다. 파일을 저장하면 자동으로 다시 빌드됩니다.
Windows 에서 변경 감지가 안 되면 `bundle exec jekyll serve --livereload --force_polling` 으로 실행하세요.

빌드만 확인하려면:

```bash
bundle exec jekyll build
```

결과물은 `_site/` 에 생성됩니다 (git 에서 제외).

## 글 쓰기 (마크다운 파일)

새 글은 스크립트로 만듭니다. 날짜·slug·머리말·이미지 폴더가 한 번에 준비됩니다.

```bash
ruby scripts/new-post.rb "글 제목" --category Full-Stack --tags Audio,Web --subtitle "한 줄 요약"
```

카테고리는 `기획` · `Full-Stack` · `AI/ML` · `Life` 네 가지입니다. 파일은 `_templates/post.md` 템플릿을 채워서 만들어지며, 템플릿 머리말에 제목·소제목·카테고리·해시태그·대표 이미지를 어디에 적는지 주석으로 표시되어 있습니다. 손으로 만들 때도 이 파일을 복사해서 채우면 됩니다.

초안으로 시작하려면 `--draft` 를 붙입니다. `_drafts/slug.md` 에 생기고 `--drafts` 로 serve 할 때만 보입니다.

```bash
ruby scripts/new-post.rb "글 제목" --draft
```

```bash
bundle exec jekyll serve --livereload --drafts
```

초안을 다 쓰면 발행합니다 (오늘 날짜로 `_posts/` 로 이동).

```bash
ruby scripts/publish-draft.rb slug
```

마크다운 문법이 화면에서 어떻게 보이는지는 [docs/WRITING-GUIDE.md](docs/WRITING-GUIDE.md) 의 매핑 표와 `_drafts/markdown-style-guide.md` 로 확인합니다.

직접 파일을 만들어도 됩니다. `_posts/YYYY-MM-DD-slug.md` 파일에 아래 머리말을 채우면 됩니다.

```yaml
---
title: 글 제목
subtitle: 카드와 상단에 보이는 한 줄 요약
category: Full-Stack    # 기획 | Full-Stack | AI/ML | Life  (_config.yml 의 categories_list)
tags: [Audio, Web]      # 카드 태그, 앞의 # 은 자동
image: /assets/images/foo.png   # 비우면 회색 플레이스홀더
---
```

- 주소는 올리브영과 같은 `/YYYY-MM-DD/slug/` 형식입니다.
- 본문의 `##`, `###` 제목으로 목차가 자동 생성되고, 스크롤에 따라 현재 섹션이 강조됩니다.
- 이미지 바로 아래 `*캡션*` 한 줄을 두면 가운데 정렬된 캡션으로 표시됩니다.



## 구조

```
_config.yml          사이트 정보, 메뉴, 카테고리, 푸터 링크, 작성자
_layouts/            default · home · post · page
_includes/           header · hero(직접 디자인 영역) · post-card · author · footer
assets/css/main.scss 디자인 토큰(:root 변수)과 모든 스타일
assets/js/main.js    모바일 메뉴 · 검색 · 카테고리/태그 필터 · 목차/스크롤스파이
_posts/              글
```



## 키 컬러 바꾸기

`assets/css/main.scss` 맨 위 `:root` 의 네 줄만 바꾸면 전체가 바뀝니다. 후보 B/C/D 값이 주석으로 적혀 있습니다.

## 40404 워드마크와 히어로

- `_includes/mark.html` — 40404 워드마크 inline SVG (fill: currentColor). 헤더 로고(키 컬러), 히어로 타이틀(검정), 푸터(흰색)에서 재사용합니다.
- `assets/images/40404-tile.svg` — 히어로 배경 패턴 타일. `.hero__deco` 가 이 파일을 `mask-image` 로 쓰고 `background-color: var(--key)` 로 칠한 뒤 `rotate(-45deg)` 로 기울입니다. 농도는 `opacity`(기본 0.08), 밀도는 `mask-size`(220×160, 모바일 165×120)로 조절합니다.
- `assets/images/favicon.svg` — 보라 배경 위 흰 40404.
- Figma 의 Hero 컴포넌트(PC 1440×400 / Tablet 768×400 / Mobile 375×220)와 같은 구성입니다.



## 배포

`.github/workflows/jekyll.yml` 이 main 에 푸시될 때 Jekyll 4 로 빌드해 Pages 에 올립니다.
저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 설정해야 합니다.

## 예전 글 되살리기

초기화 전 글은 git 기록에 남아 있습니다.

```bash
git show 05379bf --stat
git show 05379bf:_posts/파일명.md > _posts/파일명.md
```

