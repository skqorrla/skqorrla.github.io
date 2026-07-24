# skqorrla.github.io

[Alembic](https://alembic.darn.es/) 테마를 [GitHub Pages remote theme](https://github.com/daviddarnes/alembic-kit/tree/remote-theme) 방식으로 사용하는 Jekyll 블로그입니다.
`main` 브랜치에 push하면 GitHub Pages가 자동으로 빌드하여 https://skqorrla.github.io 에 배포됩니다.

## 새 게시물 작성 방법

### 1. 파일 생성

`_posts/` 폴더에 아래 파일명 규칙으로 마크다운 파일을 만듭니다. **이 규칙을 지키지 않으면 게시물로 인식되지 않습니다.**

```
_posts/YYYY-MM-DD-제목-슬러그.md
```

- 예: `_posts/2026-07-25-my-first-post.md`
- 파일명의 날짜가 게시일이 됩니다. **미래 날짜로 쓰면 해당 날짜 이후 빌드까지 게시되지 않으니 주의하세요.**
- 슬러그(파일명 뒷부분)는 URL에 쓰이므로 영문 소문자와 하이픈(`-`)을 권장합니다.

### 2. Front matter 작성

파일 맨 위에 `---`로 감싼 메타 정보(front matter)를 적고, 그 아래에 본문을 마크다운으로 작성합니다.

```markdown
---
title: 게시물 제목
categories:
- General
feature_image: "https://picsum.photos/2560/600?image=872"
---

여기부터 본문입니다. **마크다운** 문법을 그대로 쓸 수 있습니다.
```

자주 쓰는 front matter 옵션:

| 옵션 | 설명 | 필수 여부 |
|---|---|---|
| `title` | 게시물 제목 | 필수 |
| `categories` | 카테고리 목록. `/categories/` 페이지에 자동으로 묶여 표시됨 | 선택 |
| `feature_image` | 게시물 상단 배너 이미지 URL | 선택 |
| `feature_text` | 배너 위에 표시할 텍스트(마크다운 가능) | 선택 |
| `excerpt` | 목록·SEO에 쓰일 요약문. 없으면 본문 첫 부분이 사용됨 | 선택 |
| `layout` | 기본값 `post`가 `_config.yml`의 defaults로 자동 적용되므로 생략 가능 | 생략 |

### 3. 이미지 넣기

- 외부 이미지는 URL을 그대로 사용: `![설명](https://example.com/image.png)`
- 저장소에 직접 넣으려면 루트에 `assets/` 폴더(예: `assets/images/`)를 만들어 이미지를 넣고 `![설명](/assets/images/photo.png)`처럼 참조합니다.

### 4. 게시하기

```bash
git add _posts/2026-07-25-my-first-post.md
git commit -m "Add new post"
git push
```

push 후 GitHub Pages 빌드가 끝나면(보통 1~2분) 사이트에 반영됩니다. 빌드 상태는 저장소의 **Actions** 탭에서 확인할 수 있습니다.

### 로컬에서 미리보기 (선택)

Ruby와 Bundler가 설치되어 있다면:

```bash
bundle install
bundle exec jekyll serve
```

이후 브라우저에서 http://localhost:4000 으로 확인합니다. (GitHub Pages 배포 자체는 Gemfile 없이도 동작하며, Gemfile은 로컬 미리보기 용도입니다.)

---

## 원본 테마 정보

This site is based on the starter kit for [Alembic](https://alembic.darn.es/) — see the theme docs for all available settings and post options.
