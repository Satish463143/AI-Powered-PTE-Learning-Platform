// src/debug/LiveVoiceTest.jsx
import React, { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

/* ---------- config ---------- */
const START_CALL_URL = "http://localhost:3005/call/start_call";
const LIVE_MODEL = "gemini-live-2.5-flash-preview";
const USE_COOKIES = false;

function authHeaders() {
  if (USE_COOKIES) return {};
  const jwt =
    localStorage.getItem("_at") ||
    localStorage.getItem("_rt") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

const LS_TOKEN_KEY = "live_ephemeral_token";
const TTL_MS = 55_000;
const safeStringify = (o) => { try { return JSON.stringify(o); } catch { return String(o); } };

/* ---------- tiny extractors ---------- */
function harvestTextsDeep(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach(n => harvestTextsDeep(n, out)); return out; }
  for (const [k, v] of Object.entries(node)) {
    if (k === "text" && typeof v === "string") out.push(v);
    else harvestTextsDeep(v, out);
  }
  return out;
}
function harvestInlineAudioDeep(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach(n => harvestInlineAudioDeep(n, out)); return out; }
  if (node.inlineData?.data) out.push({ data: node.inlineData.data, mimeType: node.inlineData.mimeType || "" });
  for (const v of Object.values(node)) harvestInlineAudioDeep(v, out);
  return out;
}

/* ---------- component ---------- */
export default function LiveVoiceTest() {
  const [status, setStatus] = useState("idle");
  const [connected, setConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [log, setLog] = useState([]);
  const [textReplies, setTextReplies] = useState([]);
  const [input, setInput] = useState("Hello! Please reply briefly.");

  // playback
  const audioCtxRef = useRef(null);
  const playHeadRef = useRef(0);
  const audioQueueRef = useRef([]);

  // live + mic
  const liveRef = useRef(null);
  const micRef = useRef(null);
  const analyserRef = useRef(null);
  const vuRef = useRef(0); // 0..1

  function logLine(...a) { console.log(...a); setLog(p => [...p, a.map(String).join(" ")].slice(-500)); }

  useEffect(() => {
    (async () => {
      const cached = loadCachedToken();
      if (cached?.token) {
        setStatus("using-cached-token");
        await connectLive(cached.token, true);
        return;
      }
      await fetchAndConnectNewToken();
    })();
    return () => { cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    stopMic();
    try { liveRef.current?.close?.(); } catch {}
    liveRef.current = null;
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
  }

  /* ---------- token cache ---------- */
  function loadCachedToken() {
    try {
      const raw = localStorage.getItem(LS_TOKEN_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.token || !obj?.savedAt) return null;
      if (Date.now() - obj.savedAt > TTL_MS) return null;
      return obj;
    } catch { return null; }
  }
  function saveCachedToken(token) {
    try { localStorage.setItem(LS_TOKEN_KEY, JSON.stringify({ token, savedAt: Date.now() })); } catch {}
  }
  function clearCachedToken() { try { localStorage.removeItem(LS_TOKEN_KEY); } catch {} }

  async function fetchAndConnectNewToken() {
    setStatus("requesting-token");
    logLine("[SMOKE] requesting token from", START_CALL_URL);
    const res = await fetch(START_CALL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ source: "live-voice-test" }),
      credentials: USE_COOKIES ? "include" : "omit",
    });
    if (!res.ok) { logLine("[SMOKE] token http error", res.status, await res.text()); setStatus("token-error"); return; }
    const json = await res.json();
    logLine("[SMOKE] token response", json);
    const t = json?.token;
    if (!t || !String(t).startsWith("auth_tokens/")) { logLine("[SMOKE] bad token", t); setStatus("token-missing"); return; }
    saveCachedToken(t);
    await connectLive(t, false);
  }

  async function connectLive(ephemeralToken, fromCache) {
    setStatus("connecting");
    try {
      const ai = new GoogleGenAI({ apiKey: ephemeralToken, apiVersion: "v1alpha" });
      const live = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.TEXT, Modality.AUDIO],
          turnDetection: { type: "SERVER_VAD" },          // some builds ignore this with sendRealtimeInput()
          systemInstruction: "You are a helpful speaking tutor; keep answers short.",
        },
        callbacks: {
          onopen: () => { logLine("[SMOKE] live: open"); setConnected(true); setStatus("connected"); },
          onerror: (e) => {
            logLine("[SMOKE] live: error", e?.message || e);
            setStatus("error");
            if (fromCache) { clearCachedToken(); fetchAndConnectNewToken(); }
          },
          onclose: () => { logLine("[SMOKE] live: close"); setConnected(false); setStatus("closed"); },
          onmessage: onLiveEvent,
        },
      });
      if (typeof live.on === "function") {
        live.on("event", onLiveEvent);
        live.on("error", (e) => logLine("[SMOKE] live(emitter): error", e?.message || e));
      }
      liveRef.current = live;
      logLine("[SMOKE] live methods", Object.keys(live).sort());
    } catch (e) {
      logLine("[SMOKE] connect failed:", e?.message || e);
      setStatus("connect-error");
      if (fromCache) { clearCachedToken(); fetchAndConnectNewToken(); }
    }
  }

  /* ---------- events ---------- */
  function onLiveEvent(evt) {
    setLastEvent(summarize(evt));

    if (evt?.type === "output_audio" && evt?.audio instanceof Float32Array) {
      queuePCM(evt.audio, evt.sampleRate || 24000);
      return;
    }

    if (evt?.serverContent) {
      logLine("[SMOKE] serverContent (FULL):", safeStringify(evt.serverContent));
      const texts = harvestTextsDeep(evt.serverContent);
      if (texts.length) setTextReplies(p => [...p, ...texts]);
      const audios = harvestInlineAudioDeep(evt.serverContent);
      audios.forEach(queueInlineAudio);
      return;
    }

    if (evt?.setupComplete) { logLine("[SMOKE] setupComplete"); return; }
    logLine("[SMOKE] live: message", summarize(evt));
  }

  const summarize = (evt) =>
    !evt ? "null-event" :
    evt.error ? `error: ${evt.error?.message || String(evt.error)}` :
    evt.type ? evt.type :
    evt.serverContent ? "serverContent" : "unknown";

  /* ---------- send text ---------- */
  async function sendText(text) {
    if (!liveRef.current) return;
    setSending(true);
    try {
      const live = liveRef.current;
      if (typeof live.sendText === "function") {
        await live.sendText(text);
      } else if (typeof live.sendClientContent === "function") {
        await live.sendClientContent({ turns: [{ role: "user", parts: [{ text }]}], turnComplete: true });
        logLine("[SMOKE] sent text via sendClientContent()");
      } else if (live.conn?.readyState === 1) {
        live.conn.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text }]}], turnComplete: true } }));
        logLine("[SMOKE] sent text via conn.send(JSON)");
      }
    } catch (e) { logLine("[SMOKE] sendText failed:", e?.message || e); }
    finally { setSending(false); }
  }

  /* ---------- mic: streaming + manual end turn ---------- */
  async function startMic() {
    if (!liveRef.current) return;
    try {
      const live = liveRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, sampleRate: 16000 },
      });
      micRef.current = stream;

      // simple VU meter
      const ctx = ensureAudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      vuLoop();

      if (typeof live.sendInputAudioStream === "function") {
        await live.sendInputAudioStream(stream);
        logLine("[SMOKE] mic streaming via sendInputAudioStream()");
      } else if (typeof live.sendAudioStream === "function") {
        await live.sendAudioStream(stream);
        logLine("[SMOKE] mic streaming via sendAudioStream()");
      } else if (typeof live.sendRealtimeInput === "function") {
        await live.sendRealtimeInput(stream); // NOTE: this often doesn't auto-commit a turn
        logLine("[SMOKE] mic streaming via sendRealtimeInput()");
      } else {
        stopMic();
        logLine("[SMOKE] ❌ this SDK build has no mic streaming method");
        return;
      }

      setMicOn(true);
    } catch (e) { logLine("[SMOKE] startMic failed:", e?.name || e?.message || e); stopMic(); }
  }

  function vuLoop() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i] - 128) / 128;
      if (v > peak) peak = v;
    }
    vuRef.current = peak;
    if (micOn) requestAnimationFrame(vuLoop);
  }

  function stopMic() {
    try { micRef.current?.getTracks()?.forEach(t => t.stop()); } catch {}
    micRef.current = null;
    analyserRef.current = null;
    setMicOn(false);
    logLine("[SMOKE] mic stopped");
  }

  // 🔑 Workaround for builds where streaming doesn't end a turn
  function endTurn() {
    stopMic();
    const live = liveRef.current;
    if (!live) return;
    if (typeof live.sendClientContent === "function") {
      live.sendClientContent({ turnComplete: true });
      logLine("[SMOKE] sent turnComplete via sendClientContent()");
    } else if (live.conn?.readyState === 1) {
      live.conn.send(JSON.stringify({ clientContent: { turnComplete: true } }));
      logLine("[SMOKE] sent turnComplete via conn.send(JSON)");
    }
  }

  /* ---------- fallback: record a short clip and send inline ---------- */
  async function record2sAndSend() {
    if (!liveRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";

      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => e.data && chunks.push(e.data);
      rec.start();
      await waitMs(2000);
      rec.stop();
      await once(rec, "stop");
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: mime || chunks[0]?.type || "audio/webm" });
      const b64 = await blobToBase64(blob);

      // Send inline as one turn
      const live = liveRef.current;
      const part = { inlineData: { data: b64, mimeType: blob.type || "audio/webm" } };
      if (typeof live.sendClientContent === "function") {
        await live.sendClientContent({ turns: [{ role: "user", parts: [part] }], turnComplete: true });
        logLine("[SMOKE] sent inline audio turn (webm/opus)");
      } else if (live.conn?.readyState === 1) {
        live.conn.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [part] }], turnComplete: true } }));
        logLine("[SMOKE] sent inline audio turn via conn.send(JSON)");
      }
    } catch (e) { logLine("[SMOKE] record2sAndSend failed:", e?.message || e); }
  }
  const waitMs = (ms) => new Promise(r => setTimeout(r, ms));
  const once = (em, ev) => new Promise(r => em.addEventListener(ev, r, { once: true }));
  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const fr = new FileReader(); fr.onload = () => resolve(fr.result.split(",")[1]); fr.onerror = reject; fr.readAsDataURL(blob);
  });

  /* ---------- audio playback (sequenced) ---------- */
  function ensureAudioContext() {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    audioCtxRef.current = ctx;
    playHeadRef.current = ctx.currentTime;
    return ctx;
  }
  function enableAudio() {
    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(()=>{});
    setAudioEnabled(true);
    drainAudioQueue();
    logLine("[SMOKE] audio enabled + queue drained");
  }
  function schedule(buf) {
    const ctx = ensureAudioContext();
    const when = Math.max(ctx.currentTime, playHeadRef.current);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start(when);
    playHeadRef.current = when + buf.duration;
  }
  function queuePCM(float32, sr=24000) {
    const task = async () => {
      try {
        const ctx = ensureAudioContext();
        const b = ctx.createBuffer(1, float32.length, sr);
        b.getChannelData(0).set(float32);
        schedule(b);
        logLine(`[SMOKE] played PCM Float32 ${float32.length} samples @ ${sr} Hz`);
      } catch (e) { logLine("[SMOKE] PCM play failed:", e?.message || e); }
    };
    if (!audioEnabled) audioQueueRef.current.push(task); else task();
  }
  function base64ToAB(b64) {
    const bin = atob(b64), ab = new ArrayBuffer(bin.length), view = new Uint8Array(ab);
    for (let i=0;i<bin.length;i++) view[i]=bin.charCodeAt(i); return ab;
  }
  function base64PCM16ToF32(b64) {
    const bin = atob(b64), n = bin.length>>1, out = new Float32Array(n);
    for (let i=0,j=0;i<n;i++,j+=2){ let v=(bin.charCodeAt(j+1)<<8)|bin.charCodeAt(j); if(v&0x8000)v-=0x10000; out[i]=v/32768; }
    return out;
  }
  function queueInlineAudio({ data, mimeType = "" }) {
    const lower = (mimeType||"").toLowerCase();
    if (lower.startsWith("audio/pcm")) {
      const m = /rate=([0-9]+)/i.exec(mimeType); const sr = m?parseInt(m[1],10):24000;
      return queuePCM(base64PCM16ToF32(data), sr);
    }
    const task = async () => {
      try {
        const ctx = ensureAudioContext();
        const buf = await ctx.decodeAudioData(base64ToAB(data));
        schedule(buf);
        logLine("[SMOKE] decoded & scheduled encoded audio");
      } catch (e) { logLine("[SMOKE] inline audio decode failed:", e?.message || e); }
    };
    if (!audioEnabled) audioQueueRef.current.push(task); else task();
  }
  function drainAudioQueue() { const q = audioQueueRef.current; audioQueueRef.current=[]; q.forEach(fn=>fn&&fn()); }

  /* ---------- UI ---------- */
  const vu = Math.min(1, Math.max(0, vuRef.current || 0));
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 16 }}>
      <h2>Gemini Live – Voice Test (manual turn + inline fallback)</h2>

      <div style={{ marginBottom: 8 }}>
        <b>Status:</b> {status} · <b>Connected:</b> {String(connected)} · <b>Mic:</b> {micOn ? "on" : "off"}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={enableAudio} disabled={audioEnabled}>Enable Audio</button>
        <input style={{ minWidth: 320, padding: 6 }} value={input} onChange={(e)=>setInput(e.target.value)} />
        <button onClick={() => sendText(input)} disabled={!connected || sending}>Send Text</button>
        <button onClick={startMic} disabled={!connected || micOn}>Start Mic</button>
        <button onClick={endTurn} disabled={!micOn}>End Turn</button>
        <button onClick={record2sAndSend} disabled={!connected}>Record 2s & Send</button>
      </div>

      <div style={{ marginBottom: 12, width: 160, height: 10, background: "#222", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: `${(vu*100).toFixed(0)}%`, height: "100%", background: vu>0.2 ? "#0bd" : "#555" }}/>
      </div>

      {textReplies.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <b>Text replies:</b>
          <ul>{textReplies.map((t,i)=><li key={i}>{t}</li>)}</ul>
        </div>
      )}

      <pre style={{ background:"#111", color:"#ddd", padding:12, borderRadius:8, height:360, overflow:"auto", fontSize:12 }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
