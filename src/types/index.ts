import { ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface InvoiceData {
  [key: string]: any;
  lines?: Array<{
    [key: string]: any;
  }>;
}

export interface GETSField {
  path: string;
  type: string;
  required: boolean;
  format?: string;
  enum?: string[];
  pattern?: string;
}

export interface Upload {
  id: string;
  created_at: string;
  country: string;
  erp: string;
  rows_parsed: number;
  raw_data: string;
}

export interface Report {
  reportId: string;
  uploads: Upload | null;
  scores: {
    data: number;
    coverage: number;
    rules: number;
    posture: number;
    overall: number;
  };
  coverage: {
    matched: string[];
    close: Array<{
      suggestion: ReactNode;
      target: string;
      candidate: string;
      confidence: number;
    }>;
    missing: string[];
  };
  ruleFindings: Array<{
    explanation: boolean;
    rule: string;
    ok: boolean;
    exampleLine?: number;
    expected?: number;
    got?: number;
    value?: string;
  }>;
  gaps: string[];
  meta: {
    aiEnabled: boolean;
    rowsParsed: number;
    linesTotal: number;
    country: string;
    erp: string;
    db: string;
  };
}

export interface Questionnaire {
  webhooks: boolean;
  sandbox_env: boolean;
  retries: boolean;
}
