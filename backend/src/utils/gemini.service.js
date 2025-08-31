// src/utils/gemini.service.js
// Optimized for the preview SDK: @google/genai
require('dotenv').config();

class GeminiService {
  constructor() {
    if (GeminiService.instance) return GeminiService.instance;
    if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is required');

    this.liveModel = 'gemini-live-2.5-flash-preview';
    GeminiService.instance = this;
  }

  async #client() {
    // These names exist in @google/genai
    const { GoogleGenAI, Modality } = await import('@google/genai');

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
      apiVersion: 'v1alpha', // Live endpoints are under v1alpha
    });

    return { ai, Modality };
  }

  // Simple sanity check that your server key works
  async healthcheck() {
    const { ai } = await this.#client();

    // Try the new responses surface; fallback to models.generateContent
    try {
      const r = await ai.responses.generate({
        model: 'gemini-2.5-flash',
        input: 'ping',
      });
      return (typeof r.outputText === 'function') ? r.outputText() : (r.text ?? 'ok');
    } catch {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'ping',
      });
      return r.text ?? 'ok';
    }
  }

  // Create a Live ephemeral token for the browser
  async generateEphemeralToken() {
    try {
      const { ai, Modality } = await this.#client();

      const tokenResp = await ai.authTokens.create({
        config: {
          uses: 1,
          expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),   // 30 min
          newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(), // must be used within 60s to create session
          liveConnectConstraints: {
            model: this.liveModel,
            config: { responseModalities: [Modality.AUDIO] },
          },
          httpOptions: { apiVersion: 'v1alpha' },
        },
      });

      // Per preview docs: send tokenResp.name (e.g., "auth_tokens/...")
      const tokenForClient = tokenResp?.name;
      if (!tokenForClient) {
        return { success: false, error: 'Ephemeral token response missing .name' };
      }

      return { success: true, token: tokenForClient };
    } catch (error) {
      console.error('Gemini token error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return { success: false, error: error.message || 'Failed to create ephemeral token' };
    }
  }
}

module.exports = new GeminiService();
