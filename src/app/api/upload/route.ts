import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { InvoiceData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const country = formData.get('country') as string;
    const erp = formData.get('erp') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let data: InvoiceData[] = [];
    const fileContent = await file.text();

    // Parse CSV or JSON
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      data = JSON.parse(fileContent);
    } else {
      // Parse CSV
      const Papa = await import('papaparse');
      const result = Papa.parse(fileContent, { 
        header: true,
        skipEmptyLines: true 
      });
      data = result.data as InvoiceData[];
    }

    // Limit to 200 rows
    if (data.length > 200) {
      data = data.slice(0, 200);
    }

    // Store in Supabase with context data
    const { data: upload, error } = await supabase
      .from('uploads')
      .insert([
        {
          country: country || 'Unknown',
          erp: erp || 'Unknown',
          rows_parsed: data.length,
          raw_data: JSON.stringify(data),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      uploadId: upload.id,
      rowsParsed: data.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}