// 태블릿 동기화 장표 서버 — Bun 하나로 정적 페이지 + 웹소켓을 함께 띄운다. 의존성 없음.
//   발표자: https://<host>/?admin=<ADMIN_KEY>
//   태블릿: https://<host>/
// 상태는 메모리에만 둔다(재시작하면 첫 장표로). 방은 ?room=이름 으로 나뉜다.
import { join, normalize } from "node:path";

const PORT = Number(process.env.PORT || 8787);
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const ROOT = join(import.meta.dir, "public");

if (!ADMIN_KEY) console.warn("[live-sync] ADMIN_KEY가 비어 있다 — 아무나 발표자가 될 수 있다.");

/** @type {Map<string, {state: any, stateAt: number, admins: Set<any>, viewers: Set<any>}>} */
const rooms = new Map();
const room = (name) => {
  let r = rooms.get(name);
  if (!r) {
    r = { state: { slide: 0, video: { playing: false, pos: 0 }, videoId: null }, stateAt: Date.now(), admins: new Set(), viewers: new Set() };
    rooms.set(name, r);
  }
  return r;
};

// 재생 중이면 서버 시계로 지금 위치를 계산해 넘긴다 — 기기 시계를 믿지 않는다.
const current = (r) => {
  const s = r.state;
  if (!s.video?.playing) return s;
  return { ...s, video: { ...s.video, pos: s.video.pos + (Date.now() - r.stateAt) / 1000 } };
};

const peers = (r) => {
  const list = [...r.viewers].map((ws) => ws.data.slide);
  return { type: "peers", viewers: list.length, synced: list.filter((x) => x === r.state.slide).length };
};
const tellAdmins = (r) => {
  const msg = JSON.stringify(peers(r));
  for (const ws of r.admins) ws.send(msg);
};

const cleanRoom = (v) => (String(v || "otr").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "otr");

Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const isAdmin = !!ADMIN_KEY ? url.searchParams.get("key") === ADMIN_KEY : url.searchParams.has("key");
      const ok = server.upgrade(req, { data: { room: cleanRoom(url.searchParams.get("room")), admin: isAdmin, slide: -1 } });
      return ok ? undefined : new Response("upgrade failed", { status: 400 });
    }
    if (url.pathname === "/healthz") return new Response("ok");
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(join(ROOT, path));
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    // 영상은 Bun.file 이 Range 요청을 처리해 준다(태블릿 탐색·부분 로드).
    return new Response(file, { headers: { "Cache-Control": path.endsWith(".html") ? "no-cache" : "public, max-age=300" } });
  },
  websocket: {
    idleTimeout: 120,
    open(ws) {
      const r = room(ws.data.room);
      (ws.data.admin ? r.admins : r.viewers).add(ws);
      ws.send(JSON.stringify({ type: "hello", admin: ws.data.admin }));
      ws.send(JSON.stringify({ type: "state", state: current(r) }));
      tellAdmins(r);
    },
    message(ws, raw) {
      let m;
      try { m = JSON.parse(String(raw)); } catch { return; }
      const r = room(ws.data.room);
      if (m.type === "ping") { ws.send('{"type":"pong"}'); return; }
      if (m.type === "here" && typeof m.slide === "number") { ws.data.slide = m.slide; tellAdmins(r); return; }
      if (m.type === "state" && ws.data.admin && m.state && typeof m.state.slide === "number") {
        const s = m.state;
        r.state = {
          slide: Math.max(0, Math.min(999, s.slide | 0)),
          video: { playing: !!s.video?.playing, pos: Math.max(0, Number(s.video?.pos) || 0) },
          videoId: typeof s.videoId === "string" ? s.videoId.slice(0, 300) : null,
        };
        r.stateAt = Date.now();
        const out = JSON.stringify({ type: "state", state: r.state });
        for (const v of r.viewers) v.send(out);
        for (const a of r.admins) if (a !== ws) a.send(out);
        tellAdmins(r);
      }
    },
    close(ws) {
      const r = room(ws.data.room);
      r.admins.delete(ws); r.viewers.delete(ws);
      tellAdmins(r);
    },
  },
});
console.log(`[live-sync] http://localhost:${PORT}`);
