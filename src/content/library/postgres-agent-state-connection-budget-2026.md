---
title: "Postgres AI 에이전트 상태 저장: 커넥션 예산부터 잡는 법"
search_intent: "AI 에이전트 상태 저장용 Postgres에서 커넥션 풀과 작업 큐를 설계하는 방법"
subtitle: "모델 호출을 줄여도 워커가 동시에 연결을 열고 오래 잡으면, 에이전트 시스템의 처리량과 복구 가능성은 데이터베이스에서 먼저 무너진다"
description: "AI 에이전트 상태 저장에 Postgres를 쓸 때 커넥션 예산, 짧은 트랜잭션, 잠금 대기 관측으로 병목을 막는 실무 원칙을 정리한다."
publish: true
created_date: 2026-07-25
category: "DevOps"
tags:
  - Postgres
  - AI 에이전트
  - 커넥션 풀
  - 작업 큐
  - 에이전트 상태 저장
agent: luna
slug: postgres-agent-state-connection-budget-2026
reading_time: 9
featured_image: /images/library/postgres-agent-state-connection-budget-2026/thumbnail.png
featured_image_alt: "여러 AI 에이전트 워커의 데이터베이스 연결이 제한된 예산과 대기열을 통해 제어되는 모습"
youtube_id: tM9rsdFrA9Y
meta_title: "Postgres AI 에이전트 상태 저장: 커넥션 예산 | 김덕환"
meta_description: "AI 에이전트 상태용 Postgres가 과부하 나는 원인과 커넥션 예산·짧은 트랜잭션·잠금 관측으로 막는 실무 설계법."
keywords:
  - Postgres AI 에이전트
  - AI 에이전트 상태 저장
  - Postgres 커넥션 풀
  - PostgreSQL connection pool
  - 에이전트 작업 큐
og_title: "AI 에이전트 상태 저장용 Postgres: 커넥션 예산부터 잡아야 하는 이유"
og_description: "에이전트 워커 수를 늘리기 전에 Postgres 커넥션 예산과 트랜잭션 경계를 설계해야 하는 이유를 정리한다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of many AI agent workers approaching a PostgreSQL database through a clearly limited connection gateway and orderly queue, soft editorial line-art illustration, warm cream and off-white palette, muted coral and teal accents, minimal flat design, friendly, gentle shading, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-postgres-agent-state-connection-budget-2026"
  save_as: "thumbnail.png"
-->

AI 에이전트의 비용과 안정성을 모델 API 가격표만으로 판단하면 중요한 병목을 놓친다. 워커가 작업 상태, 체크포인트, 재시도 이력, 승인 기록을 Postgres에 쌓기 시작하면 데이터베이스는 단순 저장소가 아니라 실행 제어면이 된다. 나는 이 구조에서 가장 먼저 고정해야 할 숫자를 `max_connections`가 아니라 **애플리케이션이 실제로 쓸 수 있는 커넥션 예산**이라고 본다. 7월 22일 공개된 Hatchet의 Postgres 운영 가이드는 스키마·인덱스뿐 아니라 connection management, autovacuum, `FOR UPDATE SKIP LOCKED`를 한 시스템의 생존 문제로 다룬다. PostgreSQL 공식 문서도 `max_connections`를 서버 시작 시 정하는 설정으로 설명하며, 값이 클수록 공유 메모리 등 자원 할당도 함께 커진다고 명시한다. 에이전트가 늘어나는 환경에서 정답은 워커마다 넉넉한 연결을 주는 것이 아니다. 연결 수는 예산으로 제한하고, 트랜잭션은 모델 호출보다 짧게 끝내며, 대기와 잠금을 관측해야 한다.

## 에이전트 워커 수와 DB 커넥션 수를 같은 숫자로 두면 안 된다

에이전트 워커 하나가 실행 중인 시간 대부분은 모델 응답, 브라우저 자동화, 파일 처리, 외부 API 대기에 쓴다. 이 구간에 DB 트랜잭션까지 열린 채로 남아 있으면, 느린 외부 의존성이 곧바로 데이터베이스 잠금과 연결 점유로 번진다. 워커가 40개라는 이유만으로 DB 연결 40개를 기본 배정하는 설계는 그래서 위험하다. 재시도가 동시에 일어나는 순간에는 평소보다 더 많은 워커가 같은 상태 레코드와 큐 테이블을 만지게 된다.

PostgreSQL의 `max_connections`는 무한한 안전망이 아니다. 공식 문서는 설정값이 올라갈수록 PostgreSQL이 더 많은 운영체제 자원을 할당하고, 이를 서버 시작 시에만 바꿀 수 있다고 설명한다. 장애 중에 숫자를 급히 높여 해결하려 하면 메모리 압박과 새 연결 폭주를 함께 키울 수 있다. Hatchet의 가이드가 connection management를 별도 장으로 둔 이유도 여기에 있다. 쿼리 한 건이 빨라도 연결·트랜잭션·잠금의 수명 관리가 나쁘면 데이터베이스는 결국 대기열이 된다.

![AI 에이전트 워커 수와 제한된 Postgres 커넥션 예산을 분리한 구조](/images/library/postgres-agent-state-connection-budget-2026/01_connection-budget.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration showing dozens of AI agent workers with long model and browser tasks, while a smaller bounded PostgreSQL connection pool handles only short state updates; a queue and backpressure gate protect the database, soft editorial line-art illustration, warm cream and off-white palette, muted coral and teal accents, minimal flat design, friendly, gentle shading, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-postgres-agent-state-connection-budget-2026"
  save_as: "01_connection-budget.png"
-->

운영에서 먼저 정할 값은 “워커 한 개당 연결 몇 개”가 아니라 다음의 합이다.

- 서비스가 항상 남겨 둘 운영·관리용 연결 수
- API 요청 처리와 배치 작업이 각자 동시에 사용할 수 있는 최대 연결 수
- 에이전트 실행 풀에 배정할 작은 상한
- 피크 때 바로 새 연결을 만드는 대신 애플리케이션 큐에서 기다릴 수 있는 대기 한도

이 네 값을 문서화하면 모델 공급자가 느려졌을 때도 DB가 무제한 재시도의 피해를 혼자 받지 않는다. 워커 수는 처리량 목표에 맞춰 늘릴 수 있지만, 데이터베이스에 닿는 동시성은 별도 예산으로 통제해야 한다.

## 상태 기록은 짧은 트랜잭션으로 쪼개고, 외부 호출은 밖에서 기다려라

에이전트 상태 저장에서 흔한 실수는 작업을 가져온 뒤 모델 호출 결과가 올 때까지 같은 트랜잭션을 유지하는 것이다. 이 방식은 구현은 단순해 보여도, 연결 하나가 수십 초 또는 수분 동안 점유될 수 있다. 그 사이에 재시도와 다른 워커의 갱신이 쌓이면 lock wait와 pool exhaustion이 연쇄적으로 생긴다.

대신 상태 전이를 작게 나눈다. 첫 트랜잭션에서는 큐에서 작업을 원자적으로 claim하고 `running` 상태와 lease 만 저장한다. DB 연결을 반환한 뒤에 모델·브라우저·외부 API를 호출한다. 결과가 오면 두 번째 짧은 트랜잭션으로 결과와 다음 상태를 기록한다. 실행 프로세스가 죽어도 lease 만료를 본 다른 워커가 회수할 수 있어 복구 경로도 분명해진다.

아래는 Postgres에서 실제로 제공하는 `FOR UPDATE SKIP LOCKED`를 사용해 여러 워커가 같은 큐 행을 기다리지 않고 하나씩 가져오는 최소 패턴이다. 프로덕션에서는 `attempt`, `leased_until`, 실패 사유, 테넌트 범위도 함께 두고, 애플리케이션 권한에 맞게 테이블·역할을 제한해야 한다.

```sql
BEGIN;
WITH next_job AS (
  SELECT id
  FROM agent_jobs
  WHERE status = 'queued'
    AND run_after <= now()
  ORDER BY priority DESC, created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE agent_jobs AS j
SET status = 'running',
    leased_until = now() + interval '5 minutes',
    started_at = now()
FROM next_job
WHERE j.id = next_job.id
RETURNING j.id, j.payload;
COMMIT;
```

이 SQL의 핵심은 빠른 claim이다. `RETURNING`으로 가져온 작업을 DB 트랜잭션 밖에서 실행해야 한다. 큰 payload를 받아 모델에 보내거나 외부 결과를 기다리는 일을 `BEGIN`과 `COMMIT` 사이에 넣으면, `SKIP LOCKED`를 써도 연결 점유 문제는 그대로 남는다.

## 관측해야 할 것은 평균 쿼리 시간만이 아니다

평균 쿼리 시간이 낮아도 커넥션 풀이 말라 있거나 한두 개의 긴 트랜잭션이 큐를 막고 있을 수 있다. 에이전트 운영에서는 특히 다음 세 신호를 같이 본다.

1. **연결 점유**: `active`와 `idle in transaction` 세션이 언제 늘어나는지 본다. 후자는 외부 작업을 트랜잭션 안에서 기다리는 구현 결함의 강한 신호다.
2. **대기 원인**: `wait_event_type`, `wait_event`로 잠금·I/O·클라이언트 대기를 구분한다. 모든 지연을 인덱스 부족으로 해석하면 엉뚱한 최적화를 한다.
3. **큐 체류 시간**: 작업 생성부터 claim, 실행 시작, 완료까지 시간을 따로 기록한다. 모델 응답 지연과 DB 대기를 같은 ‘처리 시간’ 한 줄로 합치면 어느 계층을 고쳐야 하는지 알 수 없다.

다음 쿼리는 `pg_stat_activity`에서 현재 세션 상태와 대기 정보를 확인하는 출발점이다. 읽기 전용 관찰 쿼리이며, `psql` 18.4 환경에서 문법을 확인했다. 운영 DB에서는 제한된 모니터링 역할로 실행하고, 다른 사용자의 민감한 쿼리 텍스트를 불필요하게 수집하지 않는 범위를 정해야 한다.

```sql
SELECT state,
       wait_event_type,
       wait_event,
       count(*) AS sessions
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY 1, 2, 3
ORDER BY sessions DESC, state;
```

![에이전트 큐 체류 시간과 Postgres 세션 대기를 분리해 관측하는 모습](/images/library/postgres-agent-state-connection-budget-2026/02_queue-and-lock-observability.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished operations illustration showing a timeline that separates AI agent queue wait, short PostgreSQL transaction, external model execution, and retry outcome; database sessions and lock waits flow into a calm observability dashboard, soft editorial line-art illustration, warm cream and off-white palette, muted coral and teal accents, minimal flat design, friendly, gentle shading, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-postgres-agent-state-connection-budget-2026"
  save_as: "02_queue-and-lock-observability.png"
-->

## 내 의견: 상태 DB는 비용 절감의 뒷단이 아니라 실행 신뢰성의 앞단이다

내 의견은 분명하다. 에이전트 시스템이 모델 호출 수를 줄이고 캐시를 도입해도, 상태 DB가 무제한 연결과 긴 트랜잭션을 허용하면 절감한 비용은 재시도·대기·장애 복구에서 다시 새어 나간다. 가벼운 반론도 있다. 초기 서비스는 워커가 몇 개 안 되므로 커넥션 예산, lease, 큐 체류 시간까지 설계하는 일이 과해 보일 수 있다. 맞다. 단발성 스크립트에 복잡한 작업 큐를 만들 필요는 없다. 하지만 사람이 승인해야 하는 작업, 외부 API를 기다리는 작업, 실패 뒤 재시도하는 작업이 둘 이상 이어지면 상태 저장은 이미 실행 시스템의 일부다. 그 시점부터는 DB를 ‘로그를 넣는 곳’이 아니라 backpressure와 복구를 지키는 경계로 대해야 한다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서는 에이전트 워커를 추가하기 전에 “이 작업은 DB 연결을 얼마나 오래 잡는가”를 먼저 물어야 한다. 짧은 claim과 결과 기록만 DB에서 끝내고, 느린 모델·브라우저·외부 호출은 트랜잭션 밖으로 빼자. 이어서 커넥션 예산, lease 만료, queue wait, lock wait 네 숫자를 대시보드에 남기면, 다음 병목은 더 큰 모델이나 더 큰 DB 인스턴스가 아니라 실제로 막힌 경계에서 찾을 수 있다.

## 참고 자료

- [Hatchet — The startup's Postgres survival guide, 2026-07-22](https://hatchet.run/blog/postgres-survival-guide)
- [PostgreSQL 18 Documentation — Connections and Authentication: max_connections and connection settings](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [PostgreSQL 18 Documentation — SELECT: SKIP LOCKED](https://www.postgresql.org/docs/current/sql-select.html)
- [PostgreSQL 18 Documentation — The Statistics Collector: pg_stat_activity](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW)
