'use client';

import { useState, useRef } from 'react';
import { Report } from '@/types';
import { generateSimplePDF } from '@/lib/pdf-export';
import toast from 'react-hot-toast';
import { ScoreBar } from './ScoreBar';
import { CoverageCard } from './Coverage';
import { RuleCard } from './RuleCard';
import { AIMappingCard } from './AiMapCard';

interface ResultsStepProps {
  report: Report;
  onReset: () => void;
}

export default function ResultsStep({ report, onReset }: ResultsStepProps) {
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
  const shareableUrl = `${BASE_URL}/share/${report.reportId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast.success('Shareable link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Shareable link copied!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-readiness-report-${report.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON report downloading...');
  };

  const handlePDFExport = async () => {
    const pdfToast = toast.loading('Generating PDF...');
    try {
      generateSimplePDF(report, report.reportId);
      toast.success('PDF exported successfully!', { id: pdfToast });
    } catch {
      toast.error('PDF export failed. Try downloading JSON instead.', { id: pdfToast });
    }
  };

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">
            Your e-invoicing readiness assessment is complete
            {report.meta.aiEnabled && (
              <span className="ml-2 text-blue-600 font-medium">• AI-Powered Analysis</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(report.scores.overall)}`}>
            {report.scores.overall}%
          </div>
          <div className="text-sm text-gray-600">{getReadinessLabel(report.scores.overall)} Readiness</div>
        </div>
      </div>

      {/* Shareable URL */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
        <div className="text-blue-600 break-all">{shareableUrl}</div>
        <div className="flex space-x-2">
          <button onClick={copyToClipboard} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a href={shareableUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Open
          </a>
        </div>
      </div>

      {/* Detailed Scores */}
      <div ref={reportRef} className="space-y-4">
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
        <CoverageCard count={report.coverage.matched.length} label="Matched Fields" description="Perfectly match GETS schema" color="green" />
        <CoverageCard count={report.coverage.close.length} label="Close Matches" description="Likely match with adjustments" color="yellow" />
        <CoverageCard count={report.coverage.missing.length} label="Missing Fields" description="Required fields not found" color="red" />
      </div>

      {/* AI Mapping Suggestions */}
      {report.coverage.close.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">🧠 AI-Powered Field Mapping Suggestions</h3>
          <div className="space-y-3">
            {report.coverage.close.map((match, i) => (
              <AIMappingCard key={i} candidate={match.candidate} target={match.target} confidence={match.confidence} suggestion={match.suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Rule Validation */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Validation Results</h3>
        <div className="space-y-3">
          {report.ruleFindings.map((finding, i) => (
            <RuleCard key={i} {...finding} />
          ))}
        </div>
      </div>

      {/* Gaps */}
      {report.gaps.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identified Gaps</h3>
          <div className="space-y-2">
            {report.gaps.map((gap, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="text-sm text-red-800">{gap}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button onClick={downloadReport} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Download JSON Report</button>
        <button onClick={handlePDFExport} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Export as PDF</button>
        <button onClick={onReset} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Analyze Another File</button>
      </div>

      {/* AI Footer */}
      {report.meta.aiEnabled && (
        <div className="text-center text-sm text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
          🧠 This analysis was enhanced with AI-powered suggestions.
        </div>
      )}
    </div>
  );
}
