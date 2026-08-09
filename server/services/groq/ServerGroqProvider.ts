import dotenv from 'dotenv';
dotenv.config();

export class ServerGroqProvider {
  private defaultApiKey: string;
  private model: string = 'llama-3.3-70b-versatile';

  constructor() {
    this.defaultApiKey = process.env.GROQ_API_KEY || '';
  }

  async callGroq(
    messages: { role: string; content: string }[],
    jsonMode: boolean = true,
    customApiKey?: string
  ): Promise<any> {
    const activeKey = (customApiKey || '').trim() || this.defaultApiKey;

    if (!activeKey) {
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

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    if (jsonMode) {
      return JSON.parse(content);
    }
    return content;
  }
}
