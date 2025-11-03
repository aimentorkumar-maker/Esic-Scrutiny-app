export enum AnalysisStatus {
  IDLE,
  UPLOADING,
  ANALYZING,
  COMPLETE,
  ERROR,
}

export interface Discrepancy {
  lineItem: string;
  issue: string;
  recommendation: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface ReportData {
  summary: string;
  discrepancies: Discrepancy[];
  totalSavings: number;
}
