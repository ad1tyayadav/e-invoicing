/* eslint-disable @typescript-eslint/no-explicit-any */
import { getsSchema } from "./gets-schema";
import { generateFieldSuggestion, AISuggestion } from "./llm";

export interface FieldMatch {
  target: string;
  candidate: string;
  confidence: number;
  suggestion?: string;
}

export interface CoverageResult {
  matched: string[];
  close: FieldMatch[];
  missing: string[];
}

export async function detectFields(data: any[]): Promise<CoverageResult> {
  const sampleRow = data[0] || {};
  const csvFields = Object.keys(sampleRow);

  const matched: string[] = [];
  const close: FieldMatch[] = [];
  const missing: string[] = [];

  getsSchema.fields.forEach((getsField) => {
    const found = findBestMatch(getsField.path, csvFields);

    if (found.confidence > 0.8) {
      matched.push(getsField.path);
    } else if (found.confidence > 0.4) {
      close.push({
        target: getsField.path,
        candidate: found.field,
        confidence: found.confidence,
      });
    } else if (getsField.required) {
      missing.push(getsField.path);
    }
  });

  if (close.length > 0) {
    const suggestionPromises = close.map(async (match) => {
      const aiSuggestion : AISuggestion = await generateFieldSuggestion(
        match.target,
        match.candidate,
        match.confidence
      );
      return {
        ...match,
        suggestion: aiSuggestion.suggestion,
      };
    });

    const closeWithSuggestions = await Promise.all(suggestionPromises);
    return { matched, close: closeWithSuggestions, missing };
  }

  return { matched, close, missing };
}

function findBestMatch(
  getsPath: string,
  csvFields: string[]
): { field: string; confidence: number } {
  const getsFieldName = getsPath.split(".").pop()!.replace("[]", "");
  const normalizedGets = normalizeFieldName(getsFieldName);

  let bestMatch = { field: "", confidence: 0 };

  for (const csvField of csvFields) {
    const normalizedCsv = normalizeFieldName(csvField);
    let confidence = 0;

    // Exact match
    if (normalizedGets === normalizedCsv) {
      confidence = 1.0;
    }
    // Contains match
    else if (
      normalizedCsv.includes(normalizedGets) ||
      normalizedGets.includes(normalizedCsv)
    ) {
      confidence = 0.7;
    }
    // Partial match
    else if (
      normalizedCsv.includes(normalizedGets.slice(0, 3)) ||
      normalizedGets.includes(normalizedCsv.slice(0, 3))
    ) {
      confidence = 0.5;
    }

    if (confidence > bestMatch.confidence) {
      bestMatch = { field: csvField, confidence };
    }
  }

  return bestMatch;
}

export function generateFieldSuggestions(closeMatches: FieldMatch[]): string[] {
  return closeMatches.map((match) => {
    const confidencePercent = Math.round(match.confidence * 100);

    if (match.confidence > 0.7) {
      return `"${match.candidate}" likely maps to "${match.target}" (${confidencePercent}% confidence)`;
    } else if (match.confidence > 0.5) {
      return `"${match.candidate}" might map to "${match.target}" - check field format (${confidencePercent}% confidence)`;
    } else {
      return `Consider mapping "${match.candidate}" to "${match.target}" if data matches (${confidencePercent}% confidence)`;
    }
  });
}

export function generateRuleExplanations(ruleFindings: any[]): string[] {
  return ruleFindings
    .map((finding) => {
      if (finding.ok) return "";

      switch (finding.rule) {
        case "TOTALS_BALANCE":
          return "Fix: Ensure total_excl_vat + vat_amount = total_incl_vat (±0.01)";

        case "LINE_MATH":
          return `Fix: Line ${finding.exampleLine}: quantity × unit_price should equal line_total`;

        case "DATE_ISO":
          return "Fix: Use ISO date format YYYY-MM-DD (e.g., 2025-01-31)";

        case "CURRENCY_ALLOWED":
          return `Fix: Currency "${finding.value}" not allowed. Use AED, SAR, MYR, or USD`;

        case "TRN_PRESENT":
          return "Fix: Both buyer.trn and seller.trn fields are required";

        default:
          return "Fix: Review field formatting and values";
      }
    })
    .filter((explanation) => explanation !== "");
}

function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
