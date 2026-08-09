import {
  CandidateProfile,
  TargetRole,
  InterviewBlueprint,
  Question,
  AnswerRecord,
  QuestionEvaluation,
  FinalReport,
} from '../../types';

export interface AIProvider {
  analyzeResume(resumeText: string): Promise<CandidateProfile>;
  analyzeRoleMatch(profile: CandidateProfile, targetRole: TargetRole): Promise<TargetRole['matchMetrics']>;
  generateBlueprint(profile: CandidateProfile, targetRole: TargetRole): Promise<InterviewBlueprint>;
  generateQuestions(
    profile: CandidateProfile,
    targetRole: TargetRole,
    blueprint: InterviewBlueprint
  ): Promise<Question[]>;
  evaluateAnswer(
    question: Question,
    userAnswer: string,
    history: AnswerRecord[]
  ): Promise<QuestionEvaluation>;
  generateAdaptiveFollowUp(
    question: Question,
    userAnswer: string,
    evaluation: QuestionEvaluation
  ): Promise<Question | null>;
  evaluateCodeSubmission(
    problem: Question['codingProblem'],
    code: string,
    testResults: any[]
  ): Promise<{
    score: number;
    feedback: string;
    timeComplexity: string;
    spaceComplexity: string;
    codeQualityScore: number;
  }>;
  generateFinalReport(
    profile: CandidateProfile,
    targetRole: TargetRole,
    questions: Question[],
    answers: AnswerRecord[]
  ): Promise<FinalReport>;
}
