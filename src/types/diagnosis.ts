export interface DiagnosisPreview {
  survivalRate: number;
  survivalLabel: string;
  profileLabel: string;
  verdict: string;
}

export interface DiagnosisScores {
  aiExposure: number;
  augmentationPotential: number;
  interpersonalDepth: number;
  physicalIntelligence: number;
  adaptability: number;
}

export interface DiagnosisFlaw {
  quote: string;
  critique: string;
}

export interface DiagnosisTip {
  label: string;
  body: string;
}

export interface SurvivalStrategy {
  timeframe: string;
  action: string;
}

export interface DiagnosisFull {
  preview: DiagnosisPreview;
  scores: DiagnosisScores;
  flaws: DiagnosisFlaw[];
  strategies: SurvivalStrategy[];
  tips: DiagnosisTip[];
  actions: string[];
}

export interface QuizAnswers {
  aiUsage: string;
  jobChange: string;
  learning: string;
}
