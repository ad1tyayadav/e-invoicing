import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await context.params;

    console.log('Fetching report with ID:', reportId);

    // Query by the report ID directly (no prefix stripping needed)
    const { data: report, error } = await supabase
      .from('reports')
      .select('report_json')
      .eq('id', reportId) // Use the reportId directly as the primary key
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!report) {
      console.error('No report found for ID:', reportId);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report.report_json);
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}