import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface UploadData {
  country: string;
  erp: string;
}

interface Report {
  id: string;
  scores_overall: number;
  created_at: string;
  uploads: UploadData | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const { data: reports, error } = await supabase
      .from("reports")
      .select(
        `
        id,
        scores_overall,
        created_at,
        uploads (
          country,
          erp
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const formattedReports = (reports as unknown as Report[]).map((report) => ({
      id: report.id,
      overallScore: report.scores_overall,
      createdAt: report.created_at,
      country: report.uploads?.country || "Unknown",
      erp: report.uploads?.erp || "Unknown",
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}