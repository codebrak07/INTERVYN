export type STTState = 'IDLE' | 'LISTENING' | 'TRANSCRIBING' | 'READY' | 'ERROR';

export interface STTListener {
  onStateChange: (state: STTState) => void;
  onTranscriptUpdate: (transcript: string) => void;
  onError: (error: string) => void;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isSupported: boolean = false;
  private state: STTState = 'IDLE';
  private transcript: string = '';
  private listener?: STTListener;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.setState('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        this.transcript = currentTranscript.trim();
        if (this.listener) {
          this.listener.onTranscriptUpdate(this.transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error !== 'no-speech') {
          this.setState('ERROR');
          if (this.listener) {
            this.listener.onError(`Microphone error: ${event.error}`);
          }
        }
      };

      this.recognition.onend = () => {
        if (this.state === 'LISTENING') {
          this.setState('READY');
        }
      };
    }
  }

  public setListener(listener: STTListener) {
    this.listener = listener;
  }

  public getState(): STTState {
    return this.state;
  }

  public getTranscript(): string {
    return this.transcript;
  }

  public isBrowserSupported(): boolean {
    return this.isSupported;
  }

  public startListening() {
    if (!this.isSupported || !this.recognition) {
      this.setState('ERROR');
      if (this.listener) {
        this.listener.onError('Browser SpeechRecognition is not supported on this browser.');
      }
      return;
    }

    try {
      this.transcript = '';
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.state === 'LISTENING') {
      this.setState('TRANSCRIBING');
      this.recognition.stop();
      setTimeout(() => {
        this.setState('READY');
      }, 500);
    }
  }

  public reset() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.transcript = '';
    this.setState('IDLE');
  }

  private setState(newState: STTState) {
    this.state = newState;
    if (this.listener) {
      this.listener.onStateChange(newState);
    }
  }
}
