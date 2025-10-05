/* eslint-disable @typescript-eslint/no-explicit-any */
import { InferenceClient } from "@huggingface/inference";

const hf = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;

export interface AISuggestion {
  suggestion: string;
  confidence: number;
}

// Custom error class for API limit exceeded
export class APILimitExceededError extends Error {
  constructor(message?: string) {
    super(message || "API limit exceeded");
    this.name = "APILimitExceededError";
  }
}

// Detect if error means API limit
function isLimitExceededError(error: any): boolean {
  const indicators = [
    "rate limit",
    "quota exceeded",
    "limit exceeded",
    "too many requests",
    "403",
    "429",
    "overload",
    "usage limit",
    "billing",
  ];

  const msg = error.message?.toLowerCase() || "";
  const status = error.status || error.code || 0;

  return (
    indicators.some((i) => msg.includes(i)) || [403, 429, 503].includes(status)
  );
}

async function callHuggingFaceChat(
  prompt: string,
  model: string = "Qwen/Qwen3-Next-80B-A3B-Instruct"
): Promise<string> {
  if (!hf) {
    throw new Error("HF_TOKEN not configured");
  }

  try {
    const res = await hf.chatCompletion({
      provider: "novita",
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return res.choices?.[0]?.message?.content?.trim() || "";
  } catch (err: any) {
    console.error("HF API error:", err);

    if (isLimitExceededError(err)) {
      throw new APILimitExceededError("Your API usage limit has been reached.");
    }

    // Retry with fallback model if overload
    if (err.message?.includes("overload") || err.message?.includes("503")) {
      console.log("Primary model overloaded, trying fallback model...");
      return callHuggingFaceChat(prompt, "meta-llama/Llama-3.3-70B-Instruct");
    }

    throw err;
  }
}

export async function generateFieldSuggestion(
  targetField: string,
  candidateField: string,
  confidence: number
): Promise<AISuggestion> {
  if (process.env.ENABLE_AI !== "true") {
    return {
      suggestion: `"${candidateField}" likely maps to "${targetField}" (name similarity)`,
      confidence,
    };
  }

  try {
    const prompt = `Generate a short suggestion (<=120 characters) for mapping "${candidateField}" to "${targetField}" in an e-invoicing system. Confidence: ${confidence}. Be concise, human-readable, and practical.`;

    let suggestion = await callHuggingFaceChat(prompt);

    if (suggestion.length > 120) {
      suggestion = suggestion.substring(0, 117) + "...";
    }

    suggestion = suggestion.replace(/^["']|["']$/g, "");

    return {
      suggestion:
        suggestion || `"${candidateField}" likely maps to "${targetField}"`,
      confidence,
    };
  } catch (error) {
    console.error("AI suggestion failed:", error);
    return {
      suggestion: `"${candidateField}" likely maps to "${targetField}" (name similarity)`,
      confidence,
    };
  }
}

export function generateRuleExplanation(ruleFinding: any): string {
  if (!ruleFinding.ok) {
    switch (ruleFinding.rule) {
      case "TOTALS_BALANCE":
        return "Fix: Ensure total_excl_vat + vat_amount equals total_incl_vat (±0.01 tolerance)";
      case "LINE_MATH":
        return `Fix: Line ${ruleFinding.exampleLine}: quantity × unit_price should equal line_total`;
      case "DATE_ISO":
        return "Use ISO dates like 2025-01-31 (YYYY-MM-DD format)";
      case "CURRENCY_ALLOWED":
        return `Currency "${ruleFinding.value}" not allowed. Use AED, SAR, MYR, or USD`;
      case "TRN_PRESENT":
        return "Both buyer.trn and seller.trn fields are required and cannot be empty";
      default:
        return "Review field formatting and validation rules";
    }
  }
  return "";
}
