import { InterviewSession, InterviewPhase } from '../../types';

export class SessionStorageService {
  private static session: InterviewSession = {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    mode: 'STANDARD',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    currentPhase: 'LANDING',
    elapsedSeconds: 0,
    integrityState: {
      violationsCount: 0,
      status: 'NORMAL',
      events: [],
    },
  };

  private static listeners: Set<(session: InterviewSession) => void> = new Set();

  static getSession(): InterviewSession {
    return { ...this.session };
  }

  static updateSession(updater: (prev: InterviewSession) => InterviewSession) {
    this.session = updater(this.session);
    this.notify();
  }

  static setPhase(phase: InterviewPhase) {
    this.updateSession(prev => ({ ...prev, currentPhase: phase }));
  }

  static subscribe(listener: (session: InterviewSession) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSession());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Complete Ephemeral Teardown:
   * Clears all candidate data, resume text, transcripts, code, and answers from memory.
   */
  static clearSessionData() {
    this.session = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      mode: 'STANDARD',
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      currentPhase: 'LANDING',
      elapsedSeconds: 0,
      candidateProfile: undefined,
      resumeParseStatus: 'NONE',
      targetRole: undefined,
      blueprint: undefined,
      finalReport: undefined,
      groqApiKey: this.session.groqApiKey, // Retain optional user API key if configured
      integrityState: {
        violationsCount: 0,
        status: 'NORMAL',
        events: [],
      },
    };
    this.notify();
  }

  /**
   * Daily Usage Rate Limiting (3 free interview sessions per day)
   * Custom Groq API key unlocks unlimited sessions.
   */
  static getDailyUsageCount(): { count: number; limit: number; isLimitReached: boolean } {
    const DAILY_LIMIT = 3;
    const session = this.getSession();

    // Custom API key provides unlimited sessions
    if (session.groqApiKey) {
      return { count: 0, limit: DAILY_LIMIT, isLimitReached: false };
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDate = localStorage.getItem('intervyn_usage_date');
      const storedCount = parseInt(localStorage.getItem('intervyn_usage_count') || '0', 10);

      if (storedDate !== today) {
        localStorage.setItem('intervyn_usage_date', today);
        localStorage.setItem('intervyn_usage_count', '0');
        return { count: 0, limit: DAILY_LIMIT, isLimitReached: false };
      }

      return {
        count: storedCount,
        limit: DAILY_LIMIT,
        isLimitReached: storedCount >= DAILY_LIMIT
      };
    } catch {
      return { count: 0, limit: DAILY_LIMIT, isLimitReached: false };
    }
  }

  static incrementDailyUsage(): boolean {
    const usage = this.getDailyUsageCount();
    if (usage.isLimitReached) {
      return false; // Limit exceeded
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const newCount = usage.count + 1;
      localStorage.setItem('intervyn_usage_date', today);
      localStorage.setItem('intervyn_usage_count', String(newCount));
    } catch {
      // localStorage unavailable
    }
    return true;
  }

  private static notify() {
    const current = this.getSession();
    this.listeners.forEach(listener => listener(current));
  }
}
