'use client';

import { Report } from '@/types';
import { ScoreBar } from './ScoreBar';
import { CoverageCard } from './Coverage';
import { RuleCard } from './RuleCard';
import { AIMappingCard } from './AiMapCard';

interface ShareReportProps {
    report: Report;
}

export default function ShareReport({ report }: ShareReportProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getReadinessLabel = (score: number) => {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        return 'Low';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Invoicing Readiness Report</h1>
                        <p className="text-gray-600">
                            Generated on {new Date().toLocaleDateString()}
                            {report.meta.aiEnabled && <span className="ml-2 bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">AI-Powered Analysis</span>}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(report.scores.overall)}`}>{report.scores.overall}%</div>
                        <div className={`text-lg font-medium ${getScoreColor(report.scores.overall)}`}>{getReadinessLabel(report.scores.overall)} Readiness</div>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm font-medium text-gray-500">Country</div>
                        <div className="text-lg font-semibold text-gray-900">{report.meta.country}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm font-medium text-gray-500">ERP System</div>
                        <div className="text-lg font-semibold text-gray-900">{report.meta.erp}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm font-medium text-gray-500">Rows Analyzed</div>
                        <div className="text-lg font-semibold text-gray-900">{report.meta.rowsParsed}</div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                    {[
                        { key: 'data' as const, label: 'Data Quality', weight: '25%' },
                        { key: 'coverage' as const, label: 'Field Coverage', weight: '35%' },
                        { key: 'rules' as const, label: 'Rule Validation', weight: '30%' },
                        { key: 'posture' as const, label: 'Technical Posture', weight: '10%' },
                    ].map(({ key, label, weight }) => (
                        <ScoreBar key={key} label={label} score={report.scores[key]} weight={weight} />
                    ))}
                </div>

                {/* Coverage Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CoverageCard count={report.coverage.matched.length} label="Matched Fields" description="Perfectly aligned with GETS schema" color="green" />
                    <CoverageCard count={report.coverage.close.length} label="Close Matches" description="Likely matches with minor adjustments" color="yellow" />
                    <CoverageCard count={report.coverage.missing.length} label="Missing Fields" description="Required fields not found" color="red" />
                </div>

                {/* AI Mapping Suggestions */}
                {report.coverage.close.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
                        {report.coverage.close.map((match, i) => (
                            <AIMappingCard key={i} candidate={match.candidate} target={match.target} confidence={match.confidence} suggestion={match.suggestion} />
                        ))}
                    </div>
                )}

                {/* Rule Validation */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
                    {report.ruleFindings.map((finding, i) => (
                        <RuleCard key={i} {...finding} />
                    ))}
                </div>

                {/* Gaps */}
                {report.gaps.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-2">
                        {report.gaps.map((gap, i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                <div className="text-sm text-red-800">{gap}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm">
                    Report ID: {report.reportId} • Generated with E-Invoicing Readiness Analyzer {report.meta.aiEnabled && '• Powered by AI'}
                </div>
            </div>
        </div>
    );
}
