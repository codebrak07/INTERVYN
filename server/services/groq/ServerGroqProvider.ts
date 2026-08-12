import dotenv from 'dotenv';
import { logOperationalEvent } from '../../middleware/logger';
dotenv.config();

export class ServerGroqProvider {
  private model: string = 'llama-3.3-70b-versatile';

  private get defaultApiKey(): string {
    return (process.env.GROQ_API_KEY || '').trim();
  }

  async callGroq(
    messages: { role: string; content: string }[],
    jsonMode: boolean = true,
    customApiKey?: string,
    operationType: string = 'generic_prompt'
  ): Promise<any> {
    const activeKey = (customApiKey || '').trim() || this.defaultApiKey;
    const startTime = Date.now();

    logOperationalEvent('GROQ_REQUEST_STARTED', { operationType, jsonMode, isCustomKey: !!customApiKey });

    if (!activeKey) {
      logOperationalEvent('GROQ_AUTH_FAILED', { operationType, reason: 'Missing API Key' });
      throw new Error('Groq API Key unavailable. Provide a custom key in API settings or configure server GROQ_API_KEY.');
    }

    const payload: any = {
      model: this.model,
      messages,
      temperature: 0.2,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const durationMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401) {
          logOperationalEvent('GROQ_AUTH_FAILED', { operationType, status: res.status, durationMs });
        } else if (res.status === 429) {
          logOperationalEvent('GROQ_RATE_LIMITED', { operationType, status: res.status, durationMs });
        } else {
          logOperationalEvent('GROQ_RESPONSE_FAILED', { operationType, status: res.status, durationMs });
        }
        throw new Error(`Groq API Error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        logOperationalEvent('GROQ_RESPONSE_FAILED', { operationType, reason: 'Empty response content', durationMs });
        throw new Error('Empty response from Groq API');
      }

      logOperationalEvent('GROQ_REQUEST_SUCCESS', { operationType, durationMs });

      if (jsonMode) {
        return JSON.parse(content);
      }
      return content;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logOperationalEvent('GROQ_RESPONSE_FAILED', { operationType, durationMs, errorMsg: err.message });
      throw err;
    }
  }
}
