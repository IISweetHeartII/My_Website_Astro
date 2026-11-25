# live-sync — 태블릿 동기화 장표

발표자가 장표를 넘기거나 영상을 틀면, 같은 주소를 연 태블릿이 로그인 없이 따라 바뀐다.
Bun 하나로 정적 페이지(`public/index.html`)와 웹소켓(`/ws`)을 함께 띄운다. 의존성 없음, 상태는 메모리.

| 누가 | 주소 |
| --- | --- |
| 발표자 | `https://<host>/?admin=<ADMIN_KEY>` |
| 태블릿 | `https://<host>/` (처음 한 번 "시작하기" 탭) |
| 방 나누기 | `?room=이름` (기본 `otr`) |

## 실행

```bash
echo "ADMIN_KEY=$(openssl rand -hex 6)" > .env
docker compose up -d --build        # :8787
# 또는: ADMIN_KEY=... bun server.mjs
```

영상은 `public/media/` 에 넣고 발표자 바의 영상 주소 칸에 `/media/파일.mp4` 를 적용한다.
리버스 프록시(nginx 등)는 `/ws` 의 `Upgrade`/`Connection` 헤더를 넘겨야 한다.
