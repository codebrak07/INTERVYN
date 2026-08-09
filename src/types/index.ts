export type InterviewPhase =
  | 'LANDING'
  | 'RESUME_UPLOAD'
  | 'RESUME_ANALYZING'
  | 'ROLE_SETUP'
  | 'BLUEPRINT_READY'
  | 'INTERVIEW_INTRO'
  | 'QUESTION_VOICE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'EVALUATING'
  | 'MCQ_ROUND'
  | 'TECHNICAL_ROUND'
  | 'CODING_TRANSITION'
  | 'CODING_ARENA'
  | 'RUNNING_TESTS'
  | 'SUBMITTING_HIDDEN'
  | 'BEHAVIORAL_ROUND'
  | 'FINAL_EVALUATION'
  | 'REPORT';

export type InterviewMode = 'STANDARD' | 'TECHNICAL' | 'BEHAVIORAL' | 'CODING' | 'HIGH_PRESSURE';

export interface CandidateProfile {
  name?: string;
  skills: string[];
  projects: { title: string; description: string; tech: string[] }[];
  experience: { role: string; company: string; duration?: string; highlights: string[] }[];
  education: { degree: string; institution: string }[];
  technologies: string[];
  achievements: string[];
  claims: string[];
  potentialQuestions: string[];
  weakAreas: string[];
  rawText?: string;
}

export interface TargetRole {
  title: string;
  level: string;
  jobDescription?: string;
  matchMetrics?: {
    overallMatch: number; // 0 - 100
    technicalMatch: number;
    experienceMatch: number;
    projectMatch: number;
    skillMatch: number;
    missingSkills: string[];
    likelyInterviewTopics: string[];
    likelyCodingTopics: string[];
  };
}

export interface BlueprintSection {
  type: 'resume' | 'mcq' | 'technical' | 'coding' | 'behavioral';
  title: string;
  description: string;
  count: number;
}

export interface InterviewBlueprint {
  roleTitle: string;
  estimatedMinutes: number;
  totalQuestions: number;
  sections: BlueprintSection[];
}

export interface TestCase {
  id: string;
  description: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface TestResult {
  testId: string;
  description: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput?: string;
  error?: string;
  executionTimeMs?: number;
  isHidden?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  language: string;
  visibleTests: TestCase[];
  hiddenTests?: TestCase[];
  timeLimitMs?: number;
}

export interface MCQOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  type: 'resume' | 'mcq' | 'technical' | 'project' | 'coding' | 'behavioral' | 'followup';
  question: string;
  topic: string;
  difficulty: number; // 1 - 10
  expectedConcepts?: string[];
  followUpTriggers?: string[];
  options?: MCQOption[]; // For MCQ
  correctOptionId?: 'A' | 'B' | 'C' | 'D';
  codingProblem?: CodingProblem; // For Coding round
  parentQuestionId?: string; // For adaptive follow-up
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  questionType: Question['type'];
  userResponse: string; // voice transcript or MCQ selection or code
  voiceTranscript?: string;
  selectedMcqOptionId?: string;
  codeSubmitted?: string;
  testResults?: TestResult[];
  visiblePassed?: number;
  hiddenPassed?: number;
  totalTests?: number;
  timeSpentSeconds: number;
  evaluation?: QuestionEvaluation;
}

export interface QuestionEvaluation {
  score: number; // 0 - 100
  technicalDepth: number; // 0 - 100
  correctness: number;
  reasoning: number;
  clarity: number;
  feedback: string;
  followUpSuggested?: boolean;
  followUpQuestionPrompt?: string;
  difficultyAdjustment?: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
}

export interface CodingTelemetry {
  runsCount: number;
  submissionsCount: number;
  timeSpentSeconds: number;
  visiblePassRatio: number;
  hiddenPassRatio: number;
  finalCode: string;
  runtimeErrors: number;
}

export interface DimensionScores {
  technical: number;
  communication: number;
  problemSolving: number;
  coding: number;
  systemDesign: number;
  behavioral: number;
}

export type HiringSignal =
  | 'Strong Hire'
  | 'Hire'
  | 'Leaning Hire'
  | 'Borderline'
  | 'Leaning No Hire'
  | 'No Hire';

export interface FinalReport {
  sessionId: string;
  roleTitle: string;
  overallScore: number; // 0 - 100
  dimensionScores: DimensionScores;
  hiringSignal: HiringSignal;
  strongSignals: string[];
  concerns: string[];
  actionablePreparationPlan: string[]; // 5 clear steps
  codingPerformance?: {
    visibleTestsPassed: number;
    visibleTestsTotal: number;
    hiddenTestsPassed: number;
    hiddenTestsTotal: number;
    overallPassRatio: number;
    timeComplexity: string;
    spaceComplexity: string;
    codeQualityScore: number;
    problemSolvingScore: number;
  };
  totalDurationSeconds: number;
  questionsAnsweredCount: number;
  completedAt: string;
}

export interface InterviewSession {
  sessionId: string;
  mode: InterviewMode;
  candidateProfile?: CandidateProfile;
  targetRole?: TargetRole;
  blueprint?: InterviewBlueprint;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  currentPhase: InterviewPhase;
  startedAt?: number;
  elapsedSeconds: number;
  finalReport?: FinalReport;
  groqApiKey?: string;
  screenSharingActive?: boolean;
}
