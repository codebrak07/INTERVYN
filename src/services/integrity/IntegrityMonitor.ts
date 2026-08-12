import { SessionStorageService } from '../storage/SessionStorageService';
import { InterviewEngine } from '../../engine/InterviewEngine';
import { IntegrityEvent, IntegrityEventType, IntegrityStatus } from '../../types';

export class IntegrityMonitor {
  private static active: boolean = false;
  private static debounceTimers: Map<string, number> = new Map();
  private static mediaTracksToWatch: MediaStreamTrack[] = [];

  /**
   * Initializes real browser-observable integrity event listeners.
   */
  static startMonitoring() {
    if (this.active || typeof window === 'undefined') return;
    this.active = true;

    // 1. Tab visibility state change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 2. Window focus and blur listeners
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    // 3. Fullscreen state exit listener
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    // 4. Clipboard operations
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('contextmenu', this.handleContextMenu);
  }

  static stopMonitoring() {
    if (!this.active || typeof window === 'undefined') return;
    this.active = false;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('contextmenu', this.handleContextMenu);

    this.mediaTracksToWatch.forEach(track => {
      track.onended = null;
    });
    this.mediaTracksToWatch = [];
  }

  static watchMediaTrack(track: MediaStreamTrack, eventType: IntegrityEventType) {
    if (!track) return;
    this.mediaTracksToWatch.push(track);
    track.onended = () => {
      this.recordViolation(
        eventType,
        'high',
        `Media track (${track.kind}) ended unexpectedly.`
      );
    };
  }

  private static handleVisibilityChange = () => {
    if (document.hidden) {
      this.recordViolation(
        'TAB_HIDDEN',
        'high',
        'Interview tab lost visibility (candidate switched tabs or minimized window).'
      );
    }
  };

  private static handleWindowBlur = () => {
    this.recordViolation(
      'WINDOW_BLUR',
      'medium',
      'Window lost focus (candidate clicked outside interview window).'
    );
  };

  private static handleWindowFocus = () => {
    // Focus returned
  };

  private static handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      this.recordViolation(
        'FULLSCREEN_EXIT',
        'medium',
        'Candidate exited fullscreen mode.'
      );
    }
  };

  private static handleCopy = () => {
    this.recordViolation(
      'COPY_PASTE',
      'low',
      'Copy event observed in interview session.'
    );
  };

  private static handlePaste = () => {
    this.recordViolation(
      'COPY_PASTE',
      'medium',
      'Paste event observed in interview session.'
    );
  };

  private static handleContextMenu = () => {
    this.recordViolation(
      'CONTEXT_MENU',
      'low',
      'Context menu (right-click) triggered.'
    );
  };

  private static gracePeriodUntil: number = 0;

  static acknowledgeGracePeriod(durationMs: number = 3000) {
    this.gracePeriodUntil = Date.now() + durationMs;
  }

  /**
   * Records an integrity violation, updates count, and enforces 3-state warning policy:
   * 0 -> NORMAL
   * 1 -> WARNING 1
   * 2 -> FINAL WARNING
   * 3 -> INTERVIEW TERMINATED
   */
  static recordViolation(
    type: IntegrityEventType,
    severity: 'low' | 'medium' | 'high',
    details: string
  ) {
    if (!this.active) return;

    const now = Date.now();

    // Ignore events during grace period after candidate acknowledges warning modal
    if (now < this.gracePeriodUntil) {
      return;
    }

    // Debounce duplicate events within 2000ms window (e.g. blur + visibilitychange firing together)
    const lastTime = this.debounceTimers.get(type) || 0;
    if (now - lastTime < 2000) {
      return;
    }
    this.debounceTimers.set(type, now);

    const newEvent: IntegrityEvent = {
      id: `evt_${now}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      timestamp: now,
      severity,
      details
    };

    SessionStorageService.updateSession(prev => {
      // If already terminated, retain irreversible termination status
      if (prev.integrityState.status === 'TERMINATED') {
        return prev;
      }

      const updatedEvents = [...prev.integrityState.events, newEvent];
      const newCount = prev.integrityState.violationsCount + 1;
      let newStatus: IntegrityStatus = 'NORMAL';

      if (newCount === 1) {
        newStatus = 'WARNING_1';
      } else if (newCount === 2) {
        newStatus = 'WARNING_2';
      } else if (newCount >= 3) {
        newStatus = 'TERMINATED';
      }

      const updatedState = {
        violationsCount: newCount,
        status: newStatus,
        events: updatedEvents,
        terminatedReason: newCount >= 3 ? 'Interview terminated: integrity violation threshold exceeded (3 warnings).' : undefined
      };

      if (newCount >= 3 && prev.currentPhase !== 'REPORT' && prev.currentPhase !== 'FINAL_EVALUATION') {
        setTimeout(() => {
          this.terminateInterviewSession('Interview integrity threshold exceeded (3 warnings).');
        }, 100);
      }

      return {
        ...prev,
        integrityState: updatedState
      };
    });
  }

  static terminateInterviewSession(reason: string) {
    this.stopMonitoring();
    InterviewEngine.generateFinalReport();
  }
}
