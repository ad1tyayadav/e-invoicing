/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { detectFields } from '@/lib/field-detection';
import { validateRules } from '@/lib/rule-validaation';
import { calculateScores } from '@/lib/scoring';
import { generateRuleExplanation } from '@/lib/llm';
import { InvoiceData, Questionnaire, Report } from '@/types';
import { randomUUID } from 'crypto';
import { ReactNode } from 'react';

export async function POST(request: NextRequest) {
  try {
    const { uploadId, questionnaire } = await request.json();

    if (!uploadId) {
      return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
    }

    // Fetch upload data
    const { data: upload, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    const invoiceData: InvoiceData[] = JSON.parse(upload.raw_data);

    // Run analysis with AI suggestions
    const coverage = await detectFields(invoiceData);
    const ruleFindings = validateRules(invoiceData);

    const coverageWithSuggestions = {
  ...coverage,
  close: coverage.close.map(item => ({
    ...item,
    suggestion: `Map "${item.candidate}" to "${item.target}"` as ReactNode
  }))
};
    
    // Add rule explanations
    const ruleFindingsWithExplanations = ruleFindings.map((finding: any) => ({
      ...finding,
      explanation: generateRuleExplanation(finding)
    }));

    const scores = calculateScores(invoiceData, coverage, ruleFindingsWithExplanations, questionnaire);

    // Generate unique report ID
    const reportId = `r_${randomUUID().split('-')[0]}`;

    // Generate report
const report: Report = {
  reportId,
  scores,
  coverage: coverageWithSuggestions, // <-- now type-safe
  ruleFindings: ruleFindingsWithExplanations,
  gaps: generateGaps(coverageWithSuggestions, ruleFindingsWithExplanations),
  meta: {
    rowsParsed: upload.rows_parsed,
    linesTotal: calculateTotalLines(invoiceData),
    country: upload.country || 'Unknown',
    erp: upload.erp || 'Unknown',
    db: 'supabase',
    aiEnabled: process.env.ENABLE_AI === 'true'
  }
};

    // Store report
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .insert([
        {
          id: reportId,
          upload_id: uploadId,
          scores_overall: scores.overall,
          report_json: report,
        },
      ])
      .select()
      .single();

    if (reportError) {
      console.error('Report storage error:', reportError);
      throw reportError;
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


function generateGaps(coverage: any, ruleFindings: any[]): string[] {
  const gaps: string[] = [];

  // Coverage gaps
  coverage.missing.forEach((field: string) => {
    gaps.push(`Missing ${field}`);
  });

  // Rule gaps
  ruleFindings.forEach(finding => {
    if (!finding.ok) {
      switch (finding.rule) {
        case 'CURRENCY_ALLOWED':
          gaps.push(`Invalid currency: ${finding.value}`);
          break;
        case 'DATE_ISO':
          gaps.push('Invalid date format (use YYYY-MM-DD)');
          break;
        case 'LINE_MATH':
          gaps.push(`Line math error in line ${finding.exampleLine}`);
          break;
        case 'TOTALS_BALANCE':
          gaps.push('Invoice totals do not balance');
          break;
        case 'TRN_PRESENT':
          gaps.push('Missing TRN for buyer or seller');
          break;
      }
    }
  });

  return gaps;
}

function calculateTotalLines(invoiceData: InvoiceData[]): number {
  return invoiceData.reduce((total, invoice) => {
    return total + (invoice.lines ? invoice.lines.length : 1);
  }, 0);
}