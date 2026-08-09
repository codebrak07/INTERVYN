import dotenv from 'dotenv';
dotenv.config();

export class ServerGroqProvider {
  private apiKey: string;
  private model: string = 'llama-3.3-70b-versatile';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  async callGroq(messages: { role: string; content: string }[], jsonMode: boolean = true): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Server GROQ_API_KEY missing');
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
        'Authorization': `Bearer ${this.apiKey}`,
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
