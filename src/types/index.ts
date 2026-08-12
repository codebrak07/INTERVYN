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

export type IntegrityEventType =
  | 'TAB_HIDDEN'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'MOUSE_LEAVE'
  | 'COPY_PASTE'
  | 'CONTEXT_MENU'
  | 'CAMERA_INTERRUPTED'
  | 'SCREEN_SHARE_ENDED';

export interface IntegrityEvent {
  id: string;
  type: IntegrityEventType;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  details: string;
}

export type IntegrityStatus = 'NORMAL' | 'WARNING_1' | 'WARNING_2' | 'TERMINATED';

export interface IntegrityState {
  violationsCount: number;
  status: IntegrityStatus;
  events: IntegrityEvent[];
  terminatedReason?: string;
}

export interface CodeExecutionRequest {
  language: string;
  source: string;
  testCases: TestCase[];
  timeoutMs?: number;
}

export interface CodeExecutionResponse {
  results: TestResult[];
  executionTimeMs: number;
  error?: string;
  compilationError?: string;
  runtimeError?: string;
}

export interface FinalReport {
  sessionId: string;
  roleTitle: string;
  overallScore: number; // 0 - 100
  recommendation: 'strong_yes' | 'yes' | 'borderline' | 'no';
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  codingScore: number;
  behavioralScore: number;
  strengths: string[];
  weaknesses: string[];
  technicalGaps: string[];
  interviewSummary: string;
  codingAssessment: string;
  hiringSignals: string[];
  preparationPlan: string[];
  evidence: string[];
  integrityStatus: IntegrityStatus;
  integrityEventsCount: number;
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
  resumeParseStatus?: 'PARSED' | 'INCOMPLETE' | 'FAILED' | 'NONE';
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
  integrityState: IntegrityState;
}

export interface AssessmentEvidenceExecution {
  visibleTestsPassed: number;
  visibleTestsTotal: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  totalTestsPassed: number;
  totalTestsTotal: number;
  runtimeMs: number;
  memoryKb?: number;
  executionStatus: 'PASSED' | 'FAILED' | 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'SOURCE_LIMIT' | 'OUTPUT_LIMIT' | 'EXECUTION_UNAVAILABLE' | 'NOT_ATTEMPTED';
  submissionAttempts: number;
  finalCode?: string;
  isExecutionAvailable: boolean;
}

export interface AssessmentEvidenceObservation {
  totalQuestionsProcessed: number;
  voiceResponsesCount: number;
  mcqAttemptedCount: number;
  mcqCorrectCount: number;
  submissionAttemptsCount: number;
  integrityEventsCount: number;
  integrityEvents: IntegrityEvent[];
  warningCount: number;
  cameraStatus: 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE';
  screenShareStatus: 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE';
  terminationStatus: 'NORMAL' | 'WARNING_1' | 'WARNING_2' | 'TERMINATED';
  terminationReason?: string;
  durationMs: number;
  durationFormatted: string;
  isDurationAvailable: boolean;
}

export interface AssessmentEvidenceInterpretation {
  aiStatus: 'SUCCESS' | 'AI_RESPONSE_FAILED' | 'AI_AUTH_FAILED' | 'AI_RATE_LIMITED' | 'AI_UNAVAILABLE';
  overallScore: number;
  recommendation: 'strong_yes' | 'yes' | 'borderline' | 'no';
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  codingScore: number;
  behavioralScore: number;
  strengths: string[];
  weaknesses: string[];
  technicalGaps: string[];
  interviewSummary: string;
  codingAssessment: string;
  hiringSignals: string[];
  preparationPlan: string[];
  evidence: string[];
  isAiAvailable: boolean;
}

export interface AssessmentEvidence {
  sessionId: string;
  completedAt: string;
  roleTitle: string;
  candidateName?: string;
  execution: AssessmentEvidenceExecution;
  observation: AssessmentEvidenceObservation;
  interpretation: AssessmentEvidenceInterpretation;
}

