import { GroqProvider } from '../services/ai/GroqProvider';
import { SessionStorageService } from '../services/storage/SessionStorageService';
import { CodeExecutionService } from '../services/code/CodeExecutionService';
import {
  CandidateProfile,
  TargetRole,
  InterviewBlueprint,
  Question,
  AnswerRecord,
  QuestionEvaluation,
  FinalReport,
} from '../types';

export class InterviewEngine {
  private static groqProvider = new GroqProvider();

  static setApiKey(apiKey: string) {
    this.groqProvider.setApiKey(apiKey);
    SessionStorageService.updateSession(prev => ({ ...prev, groqApiKey: apiKey }));
  }

  static async processResume(resumeText: string): Promise<CandidateProfile> {
    SessionStorageService.setPhase('RESUME_ANALYZING');
    const profile = await this.groqProvider.analyzeResume(resumeText);
    SessionStorageService.updateSession(prev => ({
      ...prev,
      candidateProfile: profile,
      currentPhase: 'ROLE_SETUP',
    }));
    return profile;
  }

  static async setupRole(targetRoleTitle: string, jobDescription?: string) {
    const session = SessionStorageService.getSession();
    const profile = session.candidateProfile || {
      skills: ['JavaScript', 'React', 'TypeScript'],
      projects: [],
      experience: [],
      education: [],
      technologies: [],
      achievements: [],
      claims: [],
      potentialQuestions: [],
      weakAreas: [],
    };

    const targetRole: TargetRole = {
      title: targetRoleTitle,
      level: 'Senior',
      jobDescription,
    };

    const matchMetrics = await this.groqProvider.analyzeRoleMatch(profile, targetRole);
    targetRole.matchMetrics = matchMetrics;

    const blueprint = await this.groqProvider.generateBlueprint(profile, targetRole);
    const questions = await this.groqProvider.generateQuestions(profile, targetRole, blueprint);

    SessionStorageService.updateSession(prev => ({
      ...prev,
      targetRole,
      blueprint,
      questions,
      currentQuestionIndex: 0,
      currentPhase: 'BLUEPRINT_READY',
    }));
  }

  static startInterview() {
    const session = SessionStorageService.getSession();
    const firstQ = session.questions[0];

    SessionStorageService.updateSession(prev => ({
      ...prev,
      startedAt: Date.now(),
      currentPhase: firstQ ? this.getPhaseForQuestionType(firstQ.type) : 'QUESTION_VOICE',
    }));
  }

  static getPhaseForQuestionType(type: Question['type']) {
    switch (type) {
      case 'mcq':
        return 'MCQ_ROUND';
      case 'coding':
        return 'CODING_TRANSITION';
      case 'behavioral':
        return 'BEHAVIORAL_ROUND';
      default:
        return 'QUESTION_VOICE';
    }
  }

  static getCurrentQuestion(): Question | null {
    const session = SessionStorageService.getSession();
    return session.questions[session.currentQuestionIndex] || null;
  }

  static async submitVoiceAnswer(transcript: string, timeSpentSeconds: number) {
    const session = SessionStorageService.getSession();
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;

    SessionStorageService.setPhase('EVALUATING');

    const evaluation: QuestionEvaluation = await this.groqProvider.evaluateAnswer(
      currentQ,
      transcript,
      session.answers
    );

    const answerRecord: AnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      questionType: currentQ.type,
      userResponse: transcript,
      voiceTranscript: transcript,
      timeSpentSeconds,
      evaluation,
    };

    SessionStorageService.updateSession(prev => ({
      ...prev,
      answers: [...prev.answers, answerRecord],
    }));

    // Check for adaptive follow-up
    if (evaluation.followUpSuggested && currentQ.type !== 'followup') {
      const followUpQ = await this.groqProvider.generateAdaptiveFollowUp(currentQ, transcript, evaluation);
      if (followUpQ) {
        // Insert follow up question directly after current question
        SessionStorageService.updateSession(prev => {
          const updatedQs = [...prev.questions];
          updatedQs.splice(prev.currentQuestionIndex + 1, 0, followUpQ);
          return {
            ...prev,
            questions: updatedQs,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            currentPhase: 'QUESTION_VOICE',
          };
        });
        return;
      }
    }

    this.advanceToNextQuestion();
  }

  static async submitMCQAnswer(selectedOptionId: string, timeSpentSeconds: number) {
    const session = SessionStorageService.getSession();
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;

    const isCorrect = selectedOptionId === currentQ.correctOptionId;
    const score = isCorrect ? 100 : 30;

    const evaluation: QuestionEvaluation = {
      score,
      technicalDepth: score,
      correctness: score,
      reasoning: isCorrect ? 90 : 40,
      clarity: 100,
      feedback: isCorrect
        ? 'Correct answer selected! Demonstrates strong conceptual accuracy.'
        : `Option ${selectedOptionId} is incorrect. The target option was ${currentQ.correctOptionId}.`,
    };

    const answerRecord: AnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      questionType: currentQ.type,
      userResponse: `Option ${selectedOptionId}`,
      selectedMcqOptionId: selectedOptionId,
      timeSpentSeconds,
      evaluation,
    };

    SessionStorageService.updateSession(prev => ({
      ...prev,
      answers: [...prev.answers, answerRecord],
    }));

    this.advanceToNextQuestion();
  }

  static async submitCodingSolution(code: string, timeSpentSeconds: number) {
    const session = SessionStorageService.getSession();
    const currentQ = this.getCurrentQuestion();
    if (!currentQ || !currentQ.codingProblem) return;

    SessionStorageService.setPhase('SUBMITTING_HIDDEN');

    const visibleTests = currentQ.codingProblem.visibleTests || [];
    const hiddenTests = currentQ.codingProblem.hiddenTests || [];
    const allTestCases = [...visibleTests, ...hiddenTests];

    const { results, executionTimeMs, error } = await CodeExecutionService.executeCode(code, allTestCases);

    const visibleResults = results.filter(r => !r.isHidden);
    const hiddenResults = results.filter(r => r.isHidden);

    const visiblePassed = visibleResults.filter(r => r.passed).length;
    const hiddenPassed = hiddenResults.filter(r => r.passed).length;

    const codeEval = await this.groqProvider.evaluateCodeSubmission(currentQ.codingProblem, code, results);

    const evaluation: QuestionEvaluation = {
      score: codeEval.score,
      technicalDepth: codeEval.codeQualityScore,
      correctness: codeEval.score,
      reasoning: codeEval.score,
      clarity: 90,
      feedback: codeEval.feedback,
    };

    const answerRecord: AnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      questionType: 'coding',
      userResponse: code,
      codeSubmitted: code,
      testResults: results,
      visiblePassed,
      hiddenPassed,
      totalTests: allTestCases.length,
      timeSpentSeconds,
      evaluation,
    };

    SessionStorageService.updateSession(prev => ({
      ...prev,
      answers: [...prev.answers, answerRecord],
    }));

    this.advanceToNextQuestion();
  }

  static advanceToNextQuestion() {
    const session = SessionStorageService.getSession();
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex < session.questions.length) {
      const nextQ = session.questions[nextIndex];
      const nextPhase = this.getPhaseForQuestionType(nextQ.type);

      SessionStorageService.updateSession(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        currentPhase: nextPhase,
      }));
    } else {
      this.generateFinalReport();
    }
  }

  static async generateFinalReport(): Promise<FinalReport> {
    SessionStorageService.setPhase('FINAL_EVALUATION');
    const session = SessionStorageService.getSession();

    const profile = session.candidateProfile || {
      skills: ['JavaScript', 'React'],
      projects: [],
      experience: [],
      education: [],
      technologies: [],
      achievements: [],
      claims: [],
      potentialQuestions: [],
      weakAreas: [],
    };
    const targetRole = session.targetRole || { title: 'Software Engineer', level: 'Senior' };

    const report = await this.groqProvider.generateFinalReport(
      profile,
      targetRole,
      session.questions,
      session.answers
    );

    SessionStorageService.updateSession(prev => ({
      ...prev,
      finalReport: report,
      currentPhase: 'REPORT',
    }));

    return report;
  }
}
