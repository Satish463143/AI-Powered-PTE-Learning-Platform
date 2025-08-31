// src/debug/LiveSmokeTest.jsx
import React, { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * ───────────────────────────── Config ─────────────────────────────
 */
const START_CALL_URL = "http://localhost:3005/call/start_call";
const LIVE_MODEL = "gemini-live-2.5-flash-preview";

// If your backend sets a session cookie, set this to true.
// If you use a Bearer token from localStorage/sessionStorage, set to false.
const USE_COOKIES = false;

/** Build Authorization header from localStorage/sessionStorage when not using cookies */
function authHeaders() {
  if (USE_COOKIES) return {};
  const jwt =
    localStorage.getItem("_at") ||
    localStorage.getItem("_rt") 
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

/** Ephemeral token caching */
const LS_TOKEN_KEY = "live_ephemeral_token";
const TTL_MS = 55_000; // keep token at most ~55s (they expire quickly)

/**
 * ───────────────────────────── Token Cache ─────────────────────────────
 */
function loadCachedToken() {
  try {
    const raw = localStorage.getItem(LS_TOKEN_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj?.token || !obj?.savedAt) return null;
    if (Date.now() - obj.savedAt > TTL_MS) return null;
    return obj; // { token, savedAt }
  } catch {
    return null;
  }
}
function saveCachedToken(token) {
  try {
    localStorage.setItem(
      LS_TOKEN_KEY,
      JSON.stringify({ token, savedAt: Date.now() })
    );
  } catch {}
}
function clearCachedToken() {
  try {
    localStorage.removeItem(LS_TOKEN_KEY);
  } catch {}
}

/**
 * ───────────────────────────── Component ─────────────────────────────
 */
export default function LiveSmokeTest() {
  const [status, setStatus] = useState("idle");
  const [token, setToken] = useState(null);
  const [tokenSource, setTokenSource] = useState("none"); // 'cache' | 'network' | 'none'
  const [cachedAgeMs, setCachedAgeMs] = useState(null);

  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [log, setLog] = useState([]);
  const [textReplies, setTextReplies] = useState([]);

  // audio gate (must be triggered from a user gesture)
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Refs
  const liveRef = useRef(null);
  const micRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioQueueRef = useRef([]); // queue functions until audio is enabled

  function logLine(...args) {
    // eslint-disable-next-line no-console
    console.log(...args);
    setLog((prev) => [...prev, args.map(String).join(" ")].slice(-400));
  }

  /**
   * ───────────────────────────── Lifecycle ─────────────────────────────
   */
  useEffect(() => {
    (async () => {
      // 1) Try cached token first
      const cached = loadCachedToken();
      if (cached?.token) {
        setStatus("using-cached-token");
        setToken(cached.token);
        setTokenSource("cache");
        setCachedAgeMs(Date.now() - cached.savedAt);
        logLine("[SMOKE] using cached token (age:", Date.now() - cached.savedAt, "ms)");
        await connectLive(cached.token, /*fromCache*/ true);
        return;
      }
      // 2) Else fetch a new token
      await fetchAndConnectNewToken();
    })();

    return () => {
      stopMic();
      try { liveRef.current?.close?.(); } catch {}
      liveRef.current = null;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ───────────────────────────── Token fetch ─────────────────────────────
   */
  async function fetchAndConnectNewToken() {
    setStatus("requesting-token");
    logLine("[SMOKE] requesting token from", START_CALL_URL);
    try {
      const res = await fetch(START_CALL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ source: "live-smoke-test" }),
        credentials: USE_COOKIES ? "include" : "omit",
      });

      if (!res.ok) {
        const text = await res.text();
        logLine("[SMOKE] token http error", res.status, text);
        setStatus("token-error");
        return;
      }

      const json = await res.json();
      logLine("[SMOKE] token response", json);

      const t = json?.token;
      if (!t || !String(t).startsWith("auth_tokens/")) {
        logLine("[SMOKE] ❌ expected auth_tokens/... but got:", t);
        setStatus("token-missing");
        return;
      }

      saveCachedToken(t);
      setToken(t);
      setTokenSource("network");
      setCachedAgeMs(0);
      setStatus("token-acquired");
      await connectLive(t, /*fromCache*/ false);
    } catch (err) {
      logLine("[SMOKE] token fetch failed:", err?.message || err);
      setStatus("token-error");
    }
  }

  /**
   * ───────────────────────────── Live connect ─────────────────────────────
   */
  async function connectLive(ephemeralToken, fromCache) {
    setStatus("connecting");
    try {
      const ai = new GoogleGenAI({ apiKey: ephemeralToken, apiVersion: "v1alpha" });

      const live = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.TEXT, Modality.AUDIO],
          // 👇 Let the server decide when you've finished speaking:
          turnDetection: { type: "SERVER_VAD" },
          // keep it snappy for tests
          systemInstruction:
            "You are a helpful voice tutor. Keep replies to one short sentence.",
        },
        callbacks: {
          onopen: () => {
            logLine("[SMOKE] live: open");
            setConnected(true);
            setStatus("connected");
          },
          onerror: (e) => {
            logLine("[SMOKE] live: error", e?.message || e);
            setStatus("error");
            if (fromCache) {
              logLine("[SMOKE] cached token might be expired/used — clearing cache and retrying fresh token…");
              clearCachedToken();
              setToken(null);
              setTokenSource("none");
              fetchAndConnectNewToken();
            }
          },
          onclose: () => {
            logLine("[SMOKE] live: close");
            setConnected(false);
            setStatus("closed");
          },
          onmessage: (evt) => {
            handleLiveEvent(evt);
          },
        },
      });

      // Some builds also expose an emitter API — wire it too if present:
      if (typeof live.on === "function") {
        live.on("event", handleLiveEvent);
        live.on("error", (e) => {
          logLine("[SMOKE] live(emitter): error", e?.message || e);
        });
        live.on("open", () => {
          logLine("[SMOKE] live(emitter): open");
        });
      }

      liveRef.current = live;
      logLine("[SMOKE] live methods", Object.keys(live).sort());
    } catch (err) {
      logLine("[SMOKE] connect failed:", err?.message || err);
      setStatus("connect-error");
      if (fromCache) {
        logLine("[SMOKE] clearing cached token and retrying fresh token…");
        clearCachedToken();
        setToken(null);
        setTokenSource("none");
        fetchAndConnectNewToken();
      }
    }
  }

  /**
   * ───────────────────────────── Event handling ─────────────────────────────
   */
  function handleLiveEvent(evt) {
    setLastEvent(summarizeEvent(evt));

    // 1) Binary/PCM audio
    if (evt?.type === "output_audio" && evt?.audio instanceof Float32Array) {
      const sr = evt?.sampleRate || 24_000;
      queueOrPlayPCM(evt.audio, sr);
      return;
    }

    // 2) Server content: text + (maybe) inline audio
    if (evt?.serverContent?.modelTurn?.parts) {
      for (const part of evt.serverContent.modelTurn.parts) {
        if (part.text) {
          setTextReplies((prev) => [...prev, part.text]);
        }
        if (part.inlineData?.mimeType?.startsWith("audio/") && part.inlineData?.data) {
          // inline base64 audio (mp3/wav/opus). We'll try to decode & play.
          queueOrDecodeAndPlayBase64(part.inlineData.data);
        }
      }
      return;
    }

    // 3) Everything else logged for debugging
    logLine("[SMOKE] live: message", summarizeEvent(evt));
    if (!evt?.type) {
      logLine("[SMOKE] raw event:", evt);
    }
  }

  function summarizeEvent(evt) {
    if (!evt) return "null-event";
    if (evt?.error) return `error: ${evt.error?.message || String(evt.error)}`;
    if (evt?.type) return evt.type;
    if (evt?.serverContent) return "serverContent";
    return "unknown";
  }

  /**
   * ───────────────────────────── Send Text ─────────────────────────────
   */
  async function sendText(text) {
    if (!liveRef.current) {
      logLine("[SMOKE] no live session yet");
      return;
    }
    setSending(true);
    try {
      const live = liveRef.current;

      if (typeof live.sendText === "function") {
        await live.sendText(text);
        logLine("[SMOKE] sent text via sendText()");
      } else if (typeof live.sendClientContent === "function") {
        await live.sendClientContent({
          turns: [{ role: "user", parts: [{ text }]}],
          turnComplete: true,
        });
        logLine("[SMOKE] sent text via sendClientContent()");
      } else if (live.conn?.readyState === 1 && typeof live.conn.send === "function") {
        // ultra fallback
        live.conn.send(JSON.stringify({
          clientContent: {
            turns: [{ role: "user", parts: [{ text }]}],
            turnComplete: true,
          }
        }));
        logLine("[SMOKE] sent text via conn.send(JSON)");
      } else {
        logLine("[SMOKE] ❌ no text-send method available on this SDK build");
      }
    } catch (err) {
      logLine("[SMOKE] sendText failed:", err?.message || err);
    } finally {
      setSending(false);
    }
  }

  /**
   * ───────────────────────────── Mic Start/Stop ─────────────────────────────
   */
  async function startMic() {
    if (!liveRef.current) {
      logLine("[SMOKE] no live session yet");
      return;
    }
    try {
      const live = liveRef.current;

      micRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      if (typeof live.sendInputAudioStream === "function") {
        await live.sendInputAudioStream(micRef.current);
        logLine("[SMOKE] mic streaming via sendInputAudioStream()");
      } else if (typeof live.sendAudioStream === "function") {
        await live.sendAudioStream(micRef.current);
        logLine("[SMOKE] mic streaming via sendAudioStream()");
      } else if (typeof live.sendRealtimeInput === "function") {
        await live.sendRealtimeInput(micRef.current);
        logLine("[SMOKE] mic streaming via sendRealtimeInput()");
      } else {
        stopMic();
        logLine("[SMOKE] ❌ this SDK build has no mic streaming method");
        return;
      }

      setMicOn(true);
    } catch (err) {
      logLine("[SMOKE] startMic failed:", err?.name || err?.message || err);
      stopMic();
    }
  }

  function stopMic() {
    try { micRef.current?.getTracks()?.forEach(t => t.stop()); } catch {}
    micRef.current = null;
    setMicOn(false);
    logLine("[SMOKE] mic stopped");
  }

  /**
   * ───────────────────────────── Audio helpers ─────────────────────────────
   */
  function ensureAudioContext() {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    audioCtxRef.current = ctx;
    return ctx;
  }

  function enableAudioNow() {
    try {
      const ctx = ensureAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      setAudioEnabled(true);
      drainAudioQueue();
      logLine("[SMOKE] audio enabled + queue drained");
    } catch (e) {
      logLine("[SMOKE] audio enable error:", e?.message || e);
    }
  }

  function queueOrPlayPCM(float32, sampleRate = 24000) {
    const task = async () => {
      try {
        const ctx = ensureAudioContext();
        const ch = 1;
        const buf = ctx.createBuffer(ch, float32.length, sampleRate);
        buf.getChannelData(0).set(float32);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
        logLine(`[SMOKE] played PCM Float32 ${float32.length} samples @ ${sampleRate} Hz`);
      } catch (e) {
        logLine("[SMOKE] PCM play failed:", e?.message || e);
      }
    };

    if (!audioEnabled) {
      audioQueueRef.current.push(task);
    } else {
      task();
    }
  }

  function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const buf = new ArrayBuffer(len);
    const view = new Uint8Array(buf);
    for (let i = 0; i < len; i++) view[i] = bin.charCodeAt(i);
    return buf;
  }

  function queueOrDecodeAndPlayBase64(b64) {
    const task = async () => {
      try {
        const ctx = ensureAudioContext();
        const ab = base64ToArrayBuffer(b64);
        const audioBuf = await ctx.decodeAudioData(ab);
        const src = ctx.createBufferSource();
        src.buffer = audioBuf;
        src.connect(ctx.destination);
        src.start();
        logLine("[SMOKE] decoded & played inline audio");
      } catch (e) {
        logLine("[SMOKE] inline audio decode failed:", e?.message || e);
      }
    };

    if (!audioEnabled) {
      audioQueueRef.current.push(task);
    } else {
      task();
    }
  }

  function drainAudioQueue() {
    const q = audioQueueRef.current;
    audioQueueRef.current = [];
    q.forEach((fn) => fn && fn());
  }

  /**
   * ───────────────────────────── Close & Token actions ─────────────────────────────
   */
  async function closeLive() {
    stopMic();
    try { await liveRef.current?.close?.(); } catch {}
    liveRef.current = null;
    setConnected(false);
    setStatus("closed");
    logLine("[SMOKE] live closed");
  }

  function handleRefreshToken() {
    clearCachedToken();
    setToken(null);
    setTokenSource("none");
    setCachedAgeMs(null);
    fetchAndConnectNewToken();
  }

  function handleClearCache() {
    clearCachedToken();
    setToken(null);
    setTokenSource("none");
    setCachedAgeMs(null);
    logLine("[SMOKE] cleared cached token");
  }

  /**
   * ───────────────────────────── UI ─────────────────────────────
   */
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 16, lineHeight: 1.4 }}>
      <h2>Gemini Live — Smoke Test (with localStorage + VAD)</h2>

      <div style={{ marginBottom: 12 }}>
        <div><b>Status:</b> {status}</div>
        <div><b>Connected:</b> {String(connected)}</div>
        <div>
          <b>Token source:</b> {tokenSource}
          {" · "}
          <b>Token prefix:</b>{" "}
          {token ? (String(token).slice(0, 12) + "…") : "(none)"}
          {tokenSource === "cache" && (
            <> {" · "} <b>Cache age:</b> {cachedAgeMs} ms</>
          )}
        </div>
        <div><b>Last Event:</b> {lastEvent || "(none yet)"} </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={enableAudioNow} disabled={audioEnabled}>
          Enable Audio
        </button>
        <button onClick={() => sendText("Hello from smoke test — please respond briefly.")}
                disabled={!connected || sending}>
          Send Hello
        </button>
        <button onClick={startMic} disabled={!connected || micOn}>
          Start Mic
        </button>
        <button onClick={stopMic} disabled={!micOn}>
          Stop Mic
        </button>
        <button onClick={closeLive} disabled={!connected}>
          Close
        </button>
        <button onClick={handleRefreshToken}>
          Refresh Token (force new)
        </button>
        <button onClick={handleClearCache}>
          Clear Cached Token
        </button>
      </div>

      {textReplies.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <b>Text replies:</b>
          <ul>
            {textReplies.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      <pre style={{
        background: "#111",
        color: "#ddd",
        padding: 12,
        borderRadius: 8,
        height: 320,
        overflow: "auto",
        fontSize: 12
      }}>
        {log.join("\n")}
      </pre>

      <p style={{ marginTop: 12, color: "#666", maxWidth: 720 }}>
        Workflow tip: <b>Enable Audio → Send Hello → Start Mic</b>. With
        <code> turnDetection: SERVER_VAD </code> the model replies when you pause speaking.
        Ephemeral tokens expire fast; this test caches them briefly and refreshes on failure.
      </p>
    </div>
  );
}
