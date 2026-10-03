---
title: NVIDIA 오픈 모델, 무엇이 달라졌고 어디에 쓸 수 있나
subtitle: Nemotron 계열 공개 모델의 라이선스·성능·배포 옵션을 정리하고 로컬에서 직접 돌려본 기록
category: AI/ML
tags: [NVIDIA, LLM, OpenModel]
image:
---

## 무엇이 공개됐나

NVIDIA가 공개한 Nemotron 계열 모델은 가중치뿐 아니라 학습 데이터 구성과 평가 스크립트까지 함께 풀렸다는 점이 특징입니다. 덕분에 "어디까지 재현 가능한가"를 직접 확인해 볼 수 있습니다.

## 로컬에서 돌려보기

가장 작은 모델을 기준으로 소비자용 GPU 한 장에서도 양자화 없이 추론이 가능했습니다. 설치는 아래 명령 한 줄이면 충분합니다.

```bash
pip install -U transformers accelerate
```

```python
from transformers import pipeline

pipe = pipeline("text-generation", model="nvidia/Nemotron-Mini")
print(pipe("워터마크가 뭐야?", max_new_tokens=64)[0]["generated_text"])
```

## 어디에 쓸 수 있을까

- 사내 문서 요약처럼 데이터가 밖으로 나가면 안 되는 작업
- 라이선스 제약이 적어야 하는 제품 프로토타입
- 평가 스크립트가 공개돼 있어 벤치마크를 재현해야 하는 연구

> 💡 상용 서비스에 쓰기 전에는 모델 카드의 라이선스 조항을 꼭 다시 확인하세요.
