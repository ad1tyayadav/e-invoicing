import { supabase } from '@/lib/supabase';
import ShareReport from '@/components/ShareReport';
import { Report } from '@/types';
import Link from 'next/link';

interface SharePageProps {
    params: {
        reportId: string;
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const { reportId } = params;

    try {
        // Fetch report from database
        const { data: reportRecord, error } = await supabase
            .from('reports')
            .select('report_json')
            .eq('id', reportId)
            .single();

        if (error || !reportRecord) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
                        <p className="text-gray-600">The requested report could not be found.</p>
                    </div>
                    <br />
                    <Link href={'/'} className='px-4 py-2 bg-blue-600 text-white border rounded-full hover:bg-blue-500'>
                        Go to Home
                    </Link>
                </div>
            );
        }

        const report: Report = reportRecord.report_json;

        return <ShareReport report={report} />;

    } catch (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-gray-600">Something went wrong while loading the report.</p>
                </div>
            </div>
        );
    }
}