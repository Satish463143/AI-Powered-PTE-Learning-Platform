// src/config/gemini.config.js
import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Create a Gemini Live session using callback style ONLY.
 * This avoids mixing event styles that can crash the preview SDK.
 *
 * @param {string} token                 Ephemeral "auth_tokens/..."
 * @param {(evt:any)=>void} onEvent      Called for every live event
 * @param {(err:any)=>void} onError      Called on connection error
 * @param {()=>void} onConnected         Called once the socket is open
 * @returns {Promise<{
 *   live: any,
 *   sendMic: ()=>Promise<void>,
 *   stopMic: ()=>void,
 *   sendText: (text:string)=>Promise<void>,
 *   close: ()=>Promise<void>
 * }>}
 */
export const createLiveConnection = async (token, onEvent, onError, onConnected) => {
  if (!token) throw new Error('No token for Gemini Live');

  const ai = new GoogleGenAI({ apiKey: token, apiVersion: 'v1alpha' });
  const model = 'gemini-live-2.5-flash-preview';

  // IMPORTANT: Use ONLY the callback style here.
  const live = await ai.live.connect({
    model,
    config: { responseModalities: [Modality.AUDIO] },
    onEvent: (evt) => onEvent?.(evt),
    onError: (e) => onError?.(e),
    onClose: () => { /* optional */ },
  });

  // Many preview builds resolve connect() after the socket is open.
  // Call onConnected on the next tick to be safe.
  queueMicrotask(() => onConnected?.());

  // --- Microphone handling ---
  let micStream = null;

  async function sendMic() {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
      },
    });

    if (typeof live.sendInputAudioStream === 'function') {
      await live.sendInputAudioStream(micStream);
    } else if (typeof live.sendAudioStream === 'function') {
      await live.sendAudioStream(micStream);
    } else if (typeof live.sendRealtimeInput === 'function') {
      await live.sendRealtimeInput(micStream);
    } else {
      stopMic();
      throw new Error('No mic streaming method on this SDK build');
    }
  }

  function stopMic() {
    try { micStream?.getTracks()?.forEach(t => t.stop()); } catch {}
    micStream = null;
  }

  async function sendText(text) {
    if (!text) return;
    if (typeof live.sendText === 'function') {
      await live.sendText(text);
    } else if (typeof live.send === 'function') {
      await live.send({ modality: 'text', text });
    } else if (typeof live.sendClientContent === 'function') {
      await live.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      });
    } else {
      throw new Error('No text send method on this SDK build');
    }
  }

  async function close() {
    stopMic();
    try { await live.close?.(); } catch {}
  }

  return { live, sendMic, stopMic, sendText, close };
};
