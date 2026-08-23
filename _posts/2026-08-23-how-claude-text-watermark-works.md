---
title: "Claude는 어떻게 텍스트에 보이지 않는 워터마크를 심을까"
categories:
- AI
tags:
- claude
- watermark
- llm
- ai-detection
- synthid
description: "2026년 8월, Anthropic이 Claude가 생성하는 모든 텍스트에 통계적 워터마크를 넣기 시작했습니다. 글자 하나 바꾸지 않고 어떻게 '서명'을 남길 수 있을까요? 다음 단어 확률, 비밀 키, 그리고 검출기의 원리를 정리하고, AI 텍스트 탐지가 정말 쓸모 있는 기술인지에 대한 생각을 덧붙입니다."
---

2026년 8월 11일, Anthropic은 **8월 2일 이후 출시되는 모든 Claude 모델이 생성 텍스트에 보이지 않는 워터마크를 넣는다**고 발표했습니다. EU AI Act 50조(투명성 의무)에 대응하는 조치이지만, 유럽에만 적용되는 것이 아니라 **전 세계, 모든 접근 채널**에 적용됩니다.

처음 이 소식을 들었을 때 가장 궁금했던 건 단순한 질문이었습니다. 

> 텍스트는 그냥 글자인데, 글자를 바꾸지 않고 어떻게 워터마크를 넣지?

이미지라면 픽셀 값을 살짝 조정하거나 메타데이터에 서명을 넣으면 됩니다. 하지만 텍스트는 복사-붙여넣기 한 번이면 메타데이터가 전부 날아가고, 글자를 바꾸면 의미가 바뀝니다. 이 글에서는 그 원리를 정리합니다.

![How Claude's Text Watermark Works (출처: ByteByteGo)](/assets/images/claude-text-watermark.jpeg)

## 1. 전제: LLM은 단어를 하나씩 "뽑는다"

LLM은 문장을 한 번에 만들지 않습니다. **다음 단어 하나의 확률 분포**를 만들고, 그중 하나를 뽑고, 다시 다음 단어의 확률을 계산하는 일을 반복합니다.

예를 들어 `The weather was cold and` 까지 쓴 상태라면 모델은 이런 확률표를 내놓습니다.

| 후보 | 확률 |
|---|---|
| overcast | 60% |
| grey | 35% |
| sugary | 5% |

여기서 핵심은 **정답이 하나가 아니라는 점**입니다. `overcast`든 `grey`든 둘 다 자연스러운 문장이 됩니다. 평소에는 난수 생성기(RNG)가 이 확률에 따라 하나를 고릅니다. 이 "어느 쪽이든 괜찮은 선택의 순간"이 워터마크가 숨어드는 자리입니다.

## 2. 워터마크 넣기: 난수의 출처를 바꾼다

워터마크의 트릭은 의외로 단순합니다. **무작위로 고르는 대신, 비밀 키가 정한 규칙으로 고른다.**

### Step 1. 모델이 다음 단어 확률을 만든다

이 단계는 평소와 완전히 같습니다. 모델 자체는 건드리지 않습니다.

### Step 2. 키 함수(keyed function)가 "허용되는 후보"를 정한다

평소라면 RNG가 `grey`를 뽑았을 수 있습니다. 워터마크가 켜진 상태에서는 대신 **해시 함수**가 개입합니다.

```
hash(secret_key, 직전 몇 단어)  →  허용 후보 집합
```

- 입력: 비밀 키 + 직전 몇 단어(`cold`, `and`)
- 출력: 이번 위치에서 "유효한" 단어 집합

그림에서는 이 해시가 `overcast`를 유효한 선택으로 지목했고, 모델은 `overcast`를 뽑습니다. `grey`가 틀린 게 아니라 **이번 키와 직전 문맥에서는 overcast가 '선호되는' 쪽**이었을 뿐입니다.

Anthropic의 표현을 빌리면 "선택은 여전히 무작위지만, **무작위성의 출처**가 다르다"는 것입니다. RNG 대신 키와 문맥이 동전 던지기를 대신합니다.

### Step 3. 응답 전체에 반복한다

이 과정이 단어마다 반복됩니다. 다만 모든 단어가 신호를 담는 것은 아닙니다.

- **후보가 여러 개인 자리**(초록색): 키가 개입할 여지가 있음 → 워터마크 신호가 실림
- **정답이 하나뿐인 자리**(회색): `Isaac Newton's most famous work was called ___`처럼 `Principia` 외에 답이 없으면 키가 개입할 수 없음 → 신호 없음

그래서 워터마크는 텍스트 전체에 **드문드문, 그러나 일관된 패턴**으로 뿌려집니다. 읽는 사람은 전혀 알 수 없습니다. 두 문장 모두 자연스럽기 때문입니다.

## 3. 워터마크 검출하기: 키로 다시 채점한다

검출은 생성의 역과정입니다. 모델을 돌릴 필요는 없고, **비밀 키만 있으면** 됩니다.

### Step 1. 단어 하나가 "유효한 선택"이었는지 확인

텍스트의 어떤 단어를 보고, 직전 몇 단어와 비밀 키를 같은 해시 함수에 넣습니다.

```
hash(secret_key, 직전 몇 단어)  →  허용 후보 집합
실제 단어 ∈ 허용 후보 집합 ?   →  match ✅ / miss ❌
```

`overcast` 앞의 문맥과 키로 해시를 돌렸더니 `overcast`가 허용 집합에 있다면 **match**입니다.

### Step 2. 텍스트 전체를 훑어 match 비율을 본다

이걸 텍스트 전체에 반복하면 `✓✓✗✓✓✓✗✓...` 같은 결과가 나옵니다.

- 사람이 쓴 글: 키를 모르고 썼으니 match는 우연 수준(예: 50%)
- Claude가 쓴 글: 키가 단어를 골랐으니 match가 훨씬 높음

이 **match 비율이 곧 "AI 생성 점수"**가 됩니다. 일정 임계값을 넘으면 "likely Claude", 우연 수준이면 "not Claude", 그 사이는 "uncertain"으로 판정합니다.

여기서 중요한 성질이 하나 나옵니다. 검출은 **통계적** 판정이기 때문에 **텍스트가 길수록 정확**해집니다. 동전을 10번 던져 7번 앞면이 나온 건 우연일 수 있지만, 1000번 던져 700번이면 동전이 조작된 겁니다. 그래서 짧은 문장은 판정이 불가능하거나 불확실합니다.

## 4. 이 방식의 계보: Aaronson → SynthID-Text → Claude

Anthropic은 자체 개발이 아니라 **Google DeepMind의 SynthID-Text**(2024년 Nature 게재)를 채택했다고 밝혔습니다. 이 계열의 아이디어는 2022년 Scott Aaronson(당시 OpenAI)이 제안한 "암호학적 의사난수로 샘플링하기"에서 출발합니다.

| | 설명 |
|---|---|
| 공통 원리 | 샘플링의 난수 출처를 키 기반 함수로 교체 |
| SynthID-Text 특징 | Tournament Sampling으로 후보 토큰을 키 기반 점수로 경쟁시켜 선택, 생성 오버헤드가 거의 없음 |
| 품질 영향 | Anthropic 측정 기준 품질·창의성·속도에 통계적으로 유의한 차이 없음, 추가 토큰 생성 없음 |

즉, 모델의 가중치를 바꾸거나 특정 단어를 억지로 끼워 넣는 것이 아니라 **샘플러(sampler)만 바꾼 것**입니다. 그래서 모델 품질이 떨어지지 않는다는 주장이 가능합니다.

## 5. 한계: 무엇을 잡고, 무엇을 놓치나

Anthropic이 스스로 밝힌 한계를 정리하면 다음과 같습니다.

| 상황 | 워터마크 생존 여부 |
|---|---|
| 복사-붙여넣기 | 그대로 남음 (메타데이터가 아니라 단어 선택 자체에 있으므로) |
| 가벼운 수정, 일부 문장 삭제 | 대체로 남음 |
| 철저한 패러프레이즈, 전면 재작성 | 사라짐 |
| 번역 | 사라짐 |
| 사람 글과 섞기 | 신호가 희석됨 |
| 짧은 텍스트 | 신호 부족으로 판정 불가 |
| 사실 위주 답변 | 정답이 하나인 자리가 많아 신호가 희박함 |
| **코드** | 거의 없음 — 문법상 허용되는 선택지가 적음. 주석에는 일부 남을 수 있음 |

특히 마지막 두 줄이 눈에 띕니다. **기술 문서와 코드**는 워터마크를 넣기 가장 어려운 영역입니다. "어느 쪽이든 괜찮은" 단어 선택이 적기 때문입니다.

또 한 가지, 워터마크가 증명하는 건 **"이 텍스트를 Claude가 거쳤다"**는 사실이지 **"사람의 생각이 아니다"**는 사실이 아닙니다. 내가 쓴 초안을 Claude에게 교정만 맡겨도 워터마크는 남습니다.

## 6. 그래서 AI 텍스트 탐지는 쓸모가 있을까

이 부분은 제 생각입니다.

### 워터마크는 기존 "AI 탐지기"와 다른 기술이다

지금까지의 AI 텍스트 탐지기(GPTZero 류)는 문체를 봅니다. "이건 X가 아니라 Y입니다" 같은 구조, 단어 빈도, perplexity 등으로 **추측**합니다. 기술 문서를 쓰는 사람이라면 이런 탐지기에 "AI 작성" 판정을 받아본 경험이 있을 겁니다. 명료하고 구조적인 글일수록 AI 같다고 판정하는, 본질적으로 편향된 방식입니다.

워터마크 방식은 근본이 다릅니다. **키가 있으면 통계적으로 검증 가능**하고, 사람이 쓴 글이 우연히 키 패턴을 맞출 확률은 길이가 길어질수록 0에 수렴합니다. 즉 **오탐(false positive)이 수학적으로 통제됩니다.** 이건 기존 탐지기가 절대 줄 수 없던 보장입니다.

### 하지만 미탐(false negative)은 해결하지 못한다

문제는 반대 방향입니다.

- Claude 외의 모델이 쓴 글은 애초에 Claude 키로 검출할 수 없음
- 워터마크 없는 오픈소스 모델은 얼마든지 있음
- 패러프레이즈 한 번이면 신호가 날아감
- 코드와 기술 문서는 처음부터 신호가 희박함

즉 **"워터마크 있음 → 거의 확실히 Claude"**는 성립하지만, **"워터마크 없음 → 사람이 씀"**은 전혀 성립하지 않습니다. 탐지기를 "AI 글 잡기"에 쓰려는 순간 이 비대칭이 치명적이 됩니다.

### 진짜 위험은 탐지기가 아니라 탐지기를 믿는 제도

기술 자체보다 걱정되는 건 **사용 방식**입니다.

워터마크 검출 결과가 "likely Claude"로 나왔을 때, 학교나 회사가 그것을 "이 사람은 직접 쓰지 않았다"는 증거로 쓰기 시작하면 문제가 됩니다. 앞서 본 것처럼 워터마크는 **처리 이력**을 증명할 뿐 **저작 여부**를 증명하지 않습니다. 교정만 맡긴 사람과 통째로 생성한 사람이 같은 판정을 받습니다.

반대로 "not Claude"가 나왔다고 해서 사람이 썼다고 믿는 것도 위험합니다. 우회 방법은 널려 있고, 정직하게 도구를 쓴 사람만 잡히는 역선택이 생깁니다.

### 정리

| 용도 | 판단 |
|---|---|
| 플랫폼 차원의 출처 표시 (EU AI Act 대응) | 합리적. 비용 거의 없고 오탐 통제됨 |
| 스팸·대량 생성 콘텐츠 필터링 | 유용. 정교한 우회를 안 하는 대량 생성엔 잘 먹힘 |
| 학생·직원 개개인의 "AI 사용 여부" 판정 | 부적절. 미탐 비대칭 + 저작≠처리 혼동 |
| 기술 문서·코드의 AI 여부 판정 | 사실상 불가능. 신호가 없음 |

AI 텍스트 탐지는 **출처 표시(provenance)** 도구로는 의미가 있지만, **부정행위 판별기**로는 앞으로도 쓸 수 없을 것이라고 봅니다. 워터마크가 더 정교해진다고 해결되는 문제가 아니라, "글을 누가 썼는가"라는 질문 자체가 AI 시대에는 더 이상 이분법으로 답할 수 없기 때문입니다.

## 참고 자료

- [How Claude's text watermarking works — Anthropic](https://www.anthropic.com/news/claude-text-watermark)
- [How Claude marks AI-generated content — Anthropic Help Center](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content)
- [Anthropic says it will watermark text generated by its AI models — TechCrunch](https://techcrunch.com/2026/08/11/anthropic-says-it-will-watermark-text-generated-by-its-ai-models/)
- [Anthropic shares more details about how Claude's new watermarks will work — TechCrunch](https://techcrunch.com/2026/08/15/anthropic-shares-more-details-about-how-claudes-new-watermarks-will-work/)
- [Watermarking AI-generated text and video with SynthID — Google DeepMind](https://deepmind.google/blog/watermarking-ai-generated-text-and-video-with-synthid/)
- [SynthID: Tools for watermarking and detecting LLM-generated Text — Google AI for Developers](https://ai.google.dev/responsible/docs/safeguards/synthid)
- 다이어그램 출처: ByteByteGo, "How Claude's Text Watermark Works"
