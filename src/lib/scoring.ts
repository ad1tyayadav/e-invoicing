/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvoiceData, Questionnaire } from '@/types';

export function calculateScores(
  data: InvoiceData[],
  coverage: any,
  ruleFindings: any[],
  questionnaire: Questionnaire
) {
  const dataScore = calculateDataScore(data);
  const coverageScore = calculateCoverageScore(coverage);
  const rulesScore = calculateRulesScore(ruleFindings);
  const postureScore = calculatePostureScore(questionnaire);

  const overall = Math.round(
    dataScore * 0.25 +
    coverageScore * 0.35 +
    rulesScore * 0.3 +
    postureScore * 0.1
  );

  return {
    data: Math.round(dataScore),
    coverage: Math.round(coverageScore),
    rules: Math.round(rulesScore),
    posture: Math.round(postureScore),
    overall
  };
}

function calculateDataScore(data: InvoiceData[]): number {
  if (data.length === 0) return 0;
  
  // Basic check: if we have data and can parse it
  let validRows = 0;
  data.forEach(row => {
    if (Object.keys(row).length > 0) validRows++;
  });
  
  return (validRows / data.length) * 100;
}

function calculateCoverageScore(coverage: any): number {
  const totalRequired = 15; // From GETS schema
  const matchedRequired = coverage.matched.length;
  const closeRequired = coverage.close.length;
  
  return ((matchedRequired + (closeRequired * 0.5)) / totalRequired) * 100;
}

function calculateRulesScore(ruleFindings: any[]): number {
  const passed = ruleFindings.filter(r => r.ok).length;
  return (passed / ruleFindings.length) * 100;
}

function calculatePostureScore(questionnaire: Questionnaire): number {
  let score = 0;
  if (questionnaire.webhooks) score += 40;
  if (questionnaire.sandbox_env) score += 40;
  if (questionnaire.retries) score += 20;
  return score;
}