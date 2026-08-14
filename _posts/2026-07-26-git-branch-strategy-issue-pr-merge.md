---
title: "GitHub 협업 전략 총정리: 브랜치 전략(Git Flow vs GitHub Flow), Issue·PR 관리, Merge 전략"
categories:
- Git
tags:
- git
- github
- branch-strategy
- pull-request
image:
  path: "/assets/images/git-strategy-banner.jpeg"
description: "Git Flow와 GitHub Flow 두 가지 브랜치 전략의 구조와 장단점을 비교하고, Issue·PR을 체계적으로 관리하는 방법과 세 가지 merge 전략(Merge Commit, Squash, Rebase)의 선택 기준까지 한 번에 정리합니다."
---

혼자 개발할 때는 `main` 브랜치에 바로 커밋해도 큰 문제가 없지만, 팀으로 협업을 시작하는 순간 "브랜치를 어떻게 나눌 것인가", "이슈와 PR을 어떻게 굴릴 것인가", "merge 버튼의 세 가지 옵션 중 뭘 눌러야 하는가"라는 질문에 부딪히게 됩니다. 이 글에서는 대표적인 브랜치 전략 두 가지(**Git Flow**, **GitHub Flow**)와 **Issue/PR 관리 전략**, 그리고 **merge 전략 3종**을 정리합니다.

## 1. 브랜치 전략 (Branching Strategy)

브랜치 전략은 "누가, 어떤 브랜치에서, 어떤 규칙으로 작업하고 합칠 것인가"에 대한 팀의 약속입니다. 전략이 없으면 브랜치가 난립하고, 배포 시점마다 어떤 코드가 어디에 있는지 아무도 모르는 상황이 생깁니다.

### 1-1. Git Flow

Git Flow는 2010년 Vincent Driessen이 제안한 전략으로, **역할이 다른 5종류의 브랜치**를 운영하는 것이 핵심입니다.

![Git Flow 브랜치 모델 다이어그램](/assets/images/git-flow-diagram.png)

*Git Flow의 원본 다이어그램. 시간은 위에서 아래로 흐르고, 왼쪽부터 feature branches → develop → release branches → hotfixes → master 순으로 레인이 배치되어 있습니다. 각 레인 사이를 오가는 화살표가 곧 merge 경로입니다. (출처: [Vincent Driessen, nvie.com](https://nvie.com/posts/a-successful-git-branching-model/), CC BY-SA 4.0 · 다이어그램의 `master`는 오늘날의 `main`에 해당합니다.)*

| 브랜치 | 분기 원본 | merge 대상 | 역할 |
|---|---|---|---|
| `main` | - | - | 항상 프로덕션(배포 가능) 상태 유지 |
| `develop` | `main` | - | 다음 릴리스를 위한 개발 통합 브랜치 |
| `feature/*` | `develop` | `develop` | 기능 하나당 브랜치 하나 |
| `release/*` | `develop` | `main` + `develop` | 릴리스 직전 QA, 버전 태깅 |
| `hotfix/*` | `main` | `main` + `develop` | 프로덕션 긴급 버그 수정 |

**장점**

- 릴리스 단위가 명확해서 **버전이 있는 소프트웨어**(모바일 앱, 설치형 패키지, SDK 등)에 잘 맞습니다.
- `release` 브랜치에서 QA를 진행하는 동안 `develop`에서는 다음 릴리스 개발을 병행할 수 있습니다.
- `hotfix` 경로가 정해져 있어 프로덕션 장애 대응 절차가 명확합니다.

**단점**

- 브랜치가 많고 merge 경로가 복잡해서 학습 비용과 관리 비용이 큽니다.
- 브랜치 수명이 길어 merge 충돌이 자주, 크게 발생합니다.
- 하루에도 여러 번 배포하는 **지속적 배포(CD) 환경과는 상성이 나쁩니다.** 실제로 Git Flow를 만든 Vincent Driessen 본인도 2020년에 원문에 "지속적 배포를 하는 팀이라면 GitHub Flow처럼 더 단순한 전략을 쓰라"는 주석을 추가했습니다.

### 1-2. GitHub Flow

GitHub Flow는 GitHub이 자체적으로 사용하면서 알려진 전략으로, **`main` 브랜치 하나 + 짧게 사는 topic 브랜치**만으로 굴러가는 초경량 전략입니다.

![GitHub Flow 다이어그램](/assets/images/github-flow-diagram.jpeg)

*파란색 `main` 하나에 초록색 짧은 브랜치들이 붙었다 떨어질 뿐입니다. 보라색 아이콘이 PR merge 지점이고, 그 위의 로켓은 merge 직후 곧바로 배포된다는 의미입니다.*

동작 규칙은 6줄로 요약됩니다.

1. `main`은 **항상 배포 가능한 상태**로 유지한다.
2. 작업할 때는 `main`에서 설명적인 이름의 브랜치를 딴다. (예: `feature/login-page`)
3. 커밋하고 원격에 자주 push한다.
4. 피드백이 필요하거나 merge 준비가 되면 **Pull Request**를 연다.
5. 리뷰와 CI 통과 후 `main`에 merge한다.
6. merge 즉시 배포하고, 브랜치는 삭제한다.

**장점**

- 규칙이 단순해서 온보딩이 빠르고, 소규모 팀·오픈소스에 적합합니다.
- 브랜치 수명이 짧아 충돌이 작게, 일찍 발견됩니다.
- CI/CD와 결합하면 하루 수십 번 배포하는 **지속적 배포**에 최적입니다.

**단점**

- "여러 버전을 동시에 유지"하는 요구사항(v1.x 지원 + v2.x 개발 등)을 표현할 수 없습니다.
- `main`이 곧 배포이므로 **테스트 자동화와 배포 파이프라인이 부실하면 그대로 장애**로 이어집니다.
- 릴리스 QA 기간이 별도로 필요한 조직에는 맞지 않습니다.

### 1-3. 어느 쪽을 골라야 할까

![Git Flow와 GitHub Flow 비교](/assets/images/gitflow-vs-githubflow.jpeg)

*두 전략의 복잡도 차이는 그래프 모양만 봐도 드러납니다. 왼쪽 Git Flow는 여러 레인이 얽히는 대신 달력(정해진 릴리스 주기)을 얻고, 오른쪽 GitHub Flow는 선 하나로 단순한 대신 로켓(상시 배포)을 전제로 합니다.*

| 기준 | Git Flow | GitHub Flow |
|---|---|---|
| 배포 주기 | 주기적 릴리스(주/월 단위) | 상시 배포(하루 N회) |
| 버전 관리 | 명시적 버전·다중 버전 유지 | 항상 최신 버전 하나 |
| 적합한 제품 | 모바일 앱, 설치형 SW, SDK | 웹 서비스, SaaS |
| 팀 규모·구조 | 대규모, QA 조직 분리 | 소규모, 개발자가 배포까지 |
| 학습 비용 | 높음 | 낮음 |
| 전제 조건 | 릴리스 관리 인력 | 탄탄한 CI/CD·테스트 자동화 |

요약하면 **"릴리스라는 이벤트가 존재하면 Git Flow, main에 merge되는 것이 곧 릴리스라면 GitHub Flow"**입니다. 참고로 최근에는 두 전략의 중간 형태인 Trunk-Based Development(트렁크 기반 개발)나, GitHub Flow에 production 브랜치 하나를 얹은 GitLab Flow도 많이 쓰입니다.

## 2. Issue 관리 전략

브랜치 전략이 "코드를 합치는 규칙"이라면, Issue는 "일 자체를 추적하는 단위"입니다. 잘 관리되는 저장소의 공통점은 **모든 작업이 이슈에서 시작**한다는 것입니다.

### 2-1. 이슈 템플릿 (Issue Template)

`.github/ISSUE_TEMPLATE/` 폴더에 템플릿을 두면 이슈 생성 시 정해진 양식이 자동으로 채워집니다. 최소한 **버그 리포트**와 **기능 요청** 두 가지는 만들어 두는 것이 좋습니다.

```markdown
## 🐛 버그 설명
<!-- 어떤 문제가 발생했는지 -->

## 재현 절차
1. ...
2. ...

## 기대 동작 / 실제 동작

## 환경
- OS / 브라우저 / 버전:
```

템플릿이 있으면 "재현이 안 되는 버그 리포트"에 다시 질문하는 왕복 비용이 줄어듭니다.

### 2-2. 라벨 (Label)

라벨은 **접두사로 체계를 잡는 것**이 핵심입니다. 라벨은 알파벳순으로 정렬되므로, 같은 계열에 같은 접두사를 붙이면 목록이 자동으로 그룹핑됩니다.

- `type: bug` / `type: feature` / `type: docs` — 작업 종류
- `priority: high` / `priority: medium` / `priority: low` — 우선순위
- `status: blocked` / `status: in-review` — 진행 상태
- `good first issue` — 오픈소스라면 신규 기여자 유도용

계열별로 색상 규칙을 정해 두면(예: priority는 빨강 계열 농도로) 이슈 목록에서 한눈에 심각도를 파악할 수 있습니다.

### 2-3. 마일스톤과 프로젝트

- **Milestone**: 릴리스(v1.2.0)나 스프린트 단위로 이슈를 묶고 진행률(%)을 추적합니다. 단, 마일스톤은 저장소 단위라 여러 저장소에 걸친 작업은 묶을 수 없습니다.
- **GitHub Projects**: 칸반 보드/테이블 뷰로 여러 저장소의 이슈·PR을 한 화면에서 관리합니다. 멀티 레포 팀이라면 마일스톤보다 Projects가 적합합니다.

### 2-4. 이슈 ↔ 브랜치 ↔ PR 연결

이슈 번호를 중심으로 작업 흐름을 엮는 것이 GitHub 협업의 핵심 패턴입니다.

1. 이슈 생성 → `#123` 번호 부여
2. 브랜치 이름에 이슈 번호를 포함: `feature/123-login-page`
3. PR 본문에 **closing keyword** 작성: `Closes #123`
4. PR이 기본 브랜치에 merge되는 순간 **이슈가 자동으로 닫힘**

![이슈에서 브랜치, PR을 거쳐 이슈가 자동으로 닫히는 흐름](/assets/images/issue-pr-workflow.jpeg)

*열린 이슈(초록)에서 시작해 브랜치를 파고, PR 본문에 `Closes #123`을 적어 두면, 리뷰 승인 후 merge되는 순간 이슈가 닫힌 상태(보라)로 바뀝니다. 이슈를 수동으로 닫으러 갈 필요가 없습니다.*

closing keyword는 `close / closes / closed / fix / fixes / fixed / resolve / resolves / resolved` 9가지가 지원되며, PR이 **기본 브랜치(main)를 대상으로 할 때만** 동작한다는 점에 주의해야 합니다. Git Flow처럼 `develop`으로 merge하는 구조에서는 자동으로 닫히지 않으므로 별도 자동화(Actions)가 필요합니다.

## 3. Pull Request 관리 전략

### 3-1. PR은 작게 (Small PRs)

PR 관리에서 가장 효과가 검증된 원칙입니다. 많은 팀이 **PR 하나당 300~500라인 이하, 논리적 변경 1개**를 기준으로 삼습니다.

- 작은 PR은 리뷰가 빨리 시작되고, 리뷰 품질도 높습니다. (거대한 PR은 "LGTM"으로 통과되기 쉽습니다)
- 리팩터링 + 버그 수정 + 신규 기능을 **한 PR에 섞지 않습니다.** 섞이면 리뷰어가 어떤 변경이 어떤 목적인지 분리할 수 없습니다.
- 큰 기능은 feature flag를 쓰거나, 기반 작업 → 본 작업 순으로 PR을 쪼개서 올립니다.

### 3-2. Draft PR로 일찍 공유하기

완성 전이라도 **Draft PR**로 열어두면 다음 이점이 있습니다.

- 설계 방향에 대한 피드백을 코드가 굳기 전에 받을 수 있습니다.
- CI가 미리 돌아서 완성 시점에 테스트 실패로 당황할 일이 줄어듭니다.
- 실수로 merge되는 것을 막아줍니다. (Draft 상태에서는 merge 버튼이 비활성화)

리뷰 준비가 되면 "Ready for review"로 전환합니다.

### 3-3. PR 템플릿과 리뷰 규칙

`.github/PULL_REQUEST_TEMPLATE.md`를 두면 PR 본문 양식이 자동으로 채워집니다. 보통 다음 항목을 넣습니다.

```markdown
## 변경 사항
## 관련 이슈
Closes #
## 테스트 방법
## 체크리스트
- [ ] 테스트 추가/수정
- [ ] 문서 업데이트
```

리뷰 문화 측면에서는 다음이 자주 권장됩니다.

- **첫 리뷰는 2시간(늦어도 24시간) 안에** 시작하는 것을 팀 규칙으로 삼기 — PR이 오래 열려 있을수록 충돌과 컨텍스트 손실이 커집니다.
- 리뷰어 수는 1~2명이면 충분 — 연구에 따르면 첫 번째 리뷰어가 대부분의 문제를 잡아내고, 두 번째 이후로는 효과가 급감합니다.
- 코멘트에는 "왜"를 함께 적고, 단순 취향 지적과 반드시 고쳐야 할 결함을 구분하기(예: `nit:` 접두사).

### 3-4. CODEOWNERS와 브랜치 보호 규칙

- **CODEOWNERS**: `.github/CODEOWNERS` 파일에 경로별 담당자를 지정하면, 해당 파일을 건드리는 PR에 **리뷰어가 자동으로 배정**됩니다. "Require review from Code Owners"를 켜면 담당자 승인 없이는 merge가 불가능해집니다.

```
# .github/CODEOWNERS
*.js        @frontend-team
/api/       @backend-team
/infra/     @devops-team
```

- **Branch Protection / Rulesets**: `main` 브랜치에 다음 규칙을 거는 것이 사실상 표준입니다.
  - 승인 리뷰 N개 이상 필수 (Require approving reviews)
  - CI 상태 체크 통과 필수 (Require status checks)
  - merge 전 최신 main 반영 필수 (Require branches to be up to date)
  - force push / 직접 push 금지

  2023년부터는 기존 branch protection rule을 대체하는 **Rulesets**가 제공되어, 조직 단위 일괄 적용·우회 허용 목록·감사 로그 등 더 유연한 관리가 가능합니다.

## 4. Merge 전략

PR의 merge 버튼에는 세 가지 옵션이 있습니다: **Create a merge commit**, **Squash and merge**, **Rebase and merge**. 세 방식은 코드 결과물은 같아도, `main`에 남는 히스토리 모양이 완전히 다릅니다.

![merge, squash, rebase 세 가지 merge 전략의 히스토리 비교](/assets/images/merge-strategies.jpeg)

*같은 상황(파란 `main` + 초록 브랜치 커밋 2개)을 세 방식으로 합쳤을 때의 결과. 보라색 점이 merge로 새로 생긴 커밋입니다. 위에서부터 merge commit은 부모가 둘인 합류점이 생기고, squash는 커밋 2개가 하나로 뭉쳐지며 원래 브랜치는 회색(히스토리에 남지 않음)이 되고, rebase는 합류점 없이 완전한 일직선이 됩니다.*

### 4-1. Create a Merge Commit (기본값)

브랜치의 커밋을 전부 보존하면서, 부모가 2개인 **merge commit을 새로 만들어** 합칩니다.

- **장점**: 커밋이 SHA 그대로 보존되고, "언제 어떤 브랜치가 합쳐졌는지" 맥락이 명확합니다. merge 단위 전체를 한 번에 revert하기 쉽습니다.
- **단점**: 브랜치가 많아지면 히스토리 그래프가 실타래처럼 얽혀 읽기 어려워집니다. 의미 없는 "wip", "fix typo" 커밋까지 전부 남습니다.

### 4-2. Squash and Merge

브랜치의 커밋 여러 개를 **하나의 커밋으로 뭉쳐서** main에 올립니다.

- **장점**: main 히스토리가 "PR 1개 = 커밋 1개"로 깔끔한 선형이 됩니다. 기능 단위 revert가 가장 쉽고, 커밋 메시지를 PR 제목 기준으로 정리할 수 있습니다.
- **단점**: 브랜치 내 개별 커밋의 이력(누가 언제 어떤 순서로 작업했는지)이 사라집니다. squash 후 같은 브랜치에서 계속 작업하면 충돌이 나기 쉬우므로 **merge 후 브랜치는 반드시 삭제**해야 합니다.

### 4-3. Rebase and Merge

브랜치의 커밋들을 **main 꼭대기에 그대로 재생(replay)**해서 올립니다. 커밋 개수는 유지되지만 각각이 새 커밋으로 다시 만들어지며, merge commit은 생기지 않습니다.

- **장점**: 개별 커밋을 보존하면서도 히스토리가 완전한 선형이 됩니다.
- **단점**: 커밋이 재작성되므로 SHA가 바뀌고, 실제 merge 시점 정보가 사라집니다. 커밋 하나하나가 자체적으로 빌드·테스트를 통과하도록 정리되어 있어야 의미가 있습니다. 또한 **공유 중인 브랜치를 로컬에서 rebase하면 다른 사람의 저장소가 깨질 수 있으므로**, rebase는 아직 공유되지 않은 내 브랜치를 정리할 때만 쓰는 것이 원칙입니다.

### 4-4. 무엇을 선택할까

| 기준 | Merge Commit | Squash | Rebase |
|---|---|---|---|
| main 히스토리 | 비선형(그래프) | 선형, PR당 1커밋 | 선형, 커밋 보존 |
| 개별 커밋 보존 | O | X | O (SHA는 변경) |
| merge 시점 기록 | O | △ (PR 링크로 추적) | X |
| revert 용이성 | merge 단위 | 가장 쉬움 | 커밋 단위 |
| 요구 사항 | 없음 | 브랜치 즉시 삭제 | 커밋 위생 관리 |

실무에서 많이 쓰이는 조합은 다음과 같습니다.

- **GitHub Flow + Squash and merge**: "PR 1개 = main 커밋 1개"가 되어 히스토리 관리가 가장 단순합니다. 웹 서비스 팀의 사실상 표준 조합입니다.
- **Git Flow + Merge commit(`--no-ff`)**: release/hotfix가 언제 어디로 합쳐졌는지 추적하는 것이 중요하므로 merge commit이 어울립니다.
- **Rebase and merge**: 커밋 단위 리뷰·bisect를 중시하는 팀, 커밋 메시지 컨벤션이 엄격한 오픈소스 프로젝트에서 선호합니다.

저장소 설정(Settings → General → Pull Requests)에서 허용할 merge 방식을 제한할 수 있으므로, 팀에서 전략을 정했다면 **나머지 옵션은 꺼두는 것**이 실수를 막는 가장 확실한 방법입니다.

## 5. 정리

- **브랜치 전략**: 릴리스 주기가 있는 제품은 Git Flow, 상시 배포하는 웹 서비스는 GitHub Flow. Git Flow의 창시자조차 CD 환경에서는 더 단순한 전략을 권합니다.
- **Issue**: 템플릿으로 입력 품질을 보장하고, 접두사 라벨로 분류하고, `Closes #번호`로 PR과 연결해 자동으로 닫히게 만듭니다.
- **PR**: 작게 쪼개고(300~500라인), Draft로 일찍 공유하고, CODEOWNERS + 브랜치 보호 규칙으로 리뷰를 강제합니다.
- **Merge**: 히스토리를 어떻게 남길지의 문제. GitHub Flow에는 Squash, Git Flow에는 Merge commit이 기본적으로 잘 어울리며, 팀 표준 외의 옵션은 저장소 설정에서 꺼둡니다.

결국 세 가지 전략은 독립적이지 않습니다. "GitHub Flow + 이슈 기반 작업 + 작은 PR + Squash merge"처럼 하나의 일관된 파이프라인으로 묶일 때 협업 비용이 가장 낮아집니다.

## 참고 자료

- [A successful Git branching model — Vincent Driessen (Git Flow 원문)](https://nvie.com/posts/a-successful-git-branching-model/)
- [Git Flow vs Github Flow — GeeksforGeeks](https://www.geeksforgeeks.org/git/git-flow-vs-github-flow/)
- [Github Flow vs. Git Flow: What's the Difference? — Harness](https://www.harness.io/blog/github-flow-vs-git-flow-whats-the-difference)
- [Git Flow vs GitHub Flow — Alex Hyett](https://www.alexhyett.com/git-flow-github-flow/)
- [Best practices for Projects — GitHub Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)
- [Using labels and milestones to track work — GitHub Docs](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work)
- [Linking a pull request to an issue — GitHub Docs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Pull Request Best Practices — DeployHQ](https://www.deployhq.com/blog/the-perfect-pull-request-best-practices-for-collaborative-development)
- [Best Practices for GitHub Pull Requests — Timo Reymann](https://blog.timo-reymann.de/best-practices-for-github-pull-requests/)
- [Best Practices for Reviewing Pull Requests in GitHub — Rewind](https://rewind.com/blog/best-practices-for-reviewing-pull-requests-in-github/)
- [About protected branches — GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Merge vs. Rebase vs. Squash — Mitchell Hashimoto](https://gist.github.com/mitchellh/319019b1b8aac9110fcfb1862e0c97fb)
- [What's the best GitHub pull request merge strategy? — Graphite](https://graphite.com/blog/pull-request-merge-strategy)
- [Understanding GitHub Pull Request Merge Strategies — Medium](https://medium.com/@aayushvlad/understanding-github-pull-request-merge-strategies-merge-squash-and-rebase-e4ca98e7cb3a)
