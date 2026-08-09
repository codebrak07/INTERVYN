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
      targetRole: undefined,
      blueprint: undefined,
      finalReport: undefined,
      groqApiKey: this.session.groqApiKey, // Retain optional user API key if configured
    };
    this.notify();
  }

  private static notify() {
    const current = this.getSession();
    this.listeners.forEach(listener => listener(current));
  }
}
