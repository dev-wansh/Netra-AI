export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scamType: string;
  explanation: string;
  signals: string[];
  actions: string[];
  extractedText?: string;
}

export type Theme = 'dark' | 'light';
