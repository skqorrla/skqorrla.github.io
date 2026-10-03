---
title: 오디오 재생이 미묘하게 어긋나는 문제를 잡기까지
subtitle: 브라우저 오디오 버퍼와 타이머 드리프트를 추적해 동기화를 맞춘 디버깅 기록
category: Full-Stack
tags: [Audio, Web, Debugging]
image:
---

## 증상

여러 트랙을 동시에 재생하면 처음에는 맞아 떨어지다가 1분쯤 지나면 수십 밀리초씩 어긋났습니다. 귀로 들으면 "뭔가 이상한데" 정도지만 파형을 겹쳐 보면 확실히 밀립니다.

## 원인 찾기

`setInterval`로 재생 위치를 맞추고 있었는데, 타이머는 메인 스레드가 바쁘면 늦게 울립니다. 반면 `AudioContext.currentTime`은 오디오 스레드의 시계라서 정확합니다. 두 시계가 서로 다른 속도로 흐르고 있었던 셈입니다.

```js
const ctx = new AudioContext();
const startAt = ctx.currentTime + 0.1;   // 모든 트랙을 같은 기준 시각에 예약
tracks.forEach(t => t.source.start(startAt));
```

## 해결

재생 시각을 오디오 시계 기준으로 한 번에 예약하고, 타이머는 UI 갱신에만 쓰도록 역할을 나눴습니다. 이후 10분 재생에서도 1ms 이내로 유지됐습니다.

| 방식 | 10분 후 오차 |
|---|---|
| setInterval 보정 | 약 40ms |
| AudioContext 예약 | 1ms 이내 |
