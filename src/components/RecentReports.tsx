'use client';

import { useState, useEffect } from 'react';

interface RecentReport {
    id: string;
    overallScore: number;
    createdAt: string;
    country: string;
    erp: string;
    aiEnabled?: boolean;
}

export default function RecentReports() {
    const [reports, setReports] = useState<RecentReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentReports();
    }, []);

    const fetchRecentReports = async () => {
        try {
            const response = await fetch('/api/reports?limit=10');
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching recent reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
                <div className="text-gray-500">No reports yet. Analyze your first file to see it here!</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
            <div className="space-y-3">
                {reports.map((report) => (
                    <a
                        key={report.id}
                        href={`/share/${report.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {report.country} • {report.erp}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                    {report.aiEnabled && (
                                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                            AI
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`text-lg font-bold ${getScoreColor(report.overallScore)}`}>
                                {report.overallScore}%
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}