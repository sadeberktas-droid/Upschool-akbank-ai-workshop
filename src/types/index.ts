export interface InterviewerProfile {
  title: string;
  coreFocus: string;
  psychologicalMindset: string;
  whatImpressesThem: string[];
  keyRedFlags: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'technical' | 'behavioral' | 'leadership_culture' | 'curveball' | string;
  categoryLabel: string;
  question: string;
  whyTheyAsk: string;
  answerStrategy: string;
  sampleAnswer: string;
  redFlagsToAvoid: string;
}

export interface ReverseQuestion {
  question: string;
  rationale: string;
}

export interface InterviewPrepResult {
  interviewerTitle: string;
  candidateRole: string;
  companyType?: string;
  createdAt: string;
  interviewerProfile: InterviewerProfile;
  questions: InterviewQuestion[];
  reverseQuestions: ReverseQuestion[];
  prepTips: string[];
}

export interface AcquiredCompetency {
  area: string;
  description: string;
  masteryLevel: string;
}

export interface CriticalSkillGap {
  gapName: string;
  whyItMatters: string;
  riskIfIgnored: string;
}

export interface RecommendedTraining {
  title: string;
  priority: string;
  whyThisNext: string;
  syllabusTopics: string[];
  suggestedPlatforms: string;
  portfolioProject: string;
}

export interface CareerMilestone {
  phase: string;
  timeframe: string;
  focusGoal: string;
  deliverables: string[];
}

export interface TrainingAnalysisResult {
  currentRole: string;
  targetRole: string;
  createdAt: string;
  executiveSummary: string;
  acquiredCompetencies: AcquiredCompetency[];
  criticalSkillGaps: CriticalSkillGap[];
  recommendedNextTrainings: RecommendedTraining[];
  careerMilestones: CareerMilestone[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
