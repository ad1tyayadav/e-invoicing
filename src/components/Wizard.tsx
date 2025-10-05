/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import ContextStep from './ContextStep';
import UploadStep from './UploadStep';
import ResultsStep from './ResultStep';
import { Questionnaire } from '@/types';

export type WizardStep = 'context' | 'upload' | 'results';

export default function Wizard() {
    const [currentStep, setCurrentStep] = useState<WizardStep>('context');
    const [contextData, setContextData] = useState({ country: '', erp: '' });
    const [uploadId, setUploadId] = useState<string>('');
    const [report, setReport] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const steps: WizardStep[] = ['context', 'upload', 'results'];

    const handleContextSubmit = (data: { country: string; erp: string }) => {
        setContextData(data);
        setCurrentStep('upload');
    };

    const handleUploadComplete = async (id: string) => {
        setUploadId(id);
        setIsAnalyzing(true);

        try {
            const questionnaire: Questionnaire = {
                webhooks: true,
                sandbox_env: true,
                retries: false,
            };

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploadId: id, questionnaire }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const reportData = await response.json();
            setReport(reportData);
            setCurrentStep('results');
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setCurrentStep('context');
        setContextData({ country: '', erp: '' });
        setUploadId('');
        setReport(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        E-Invoicing Readiness Analyzer
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Check how close your invoice data is to the GETS standard
                    </p>
                </header>

                {/* Stepper */}
                <nav className="flex justify-center mb-10">
                    <ol className="flex items-center space-x-6 sm:space-x-12">
                        {steps.map((step, index) => {
                            const stepIndex = steps.indexOf(currentStep);
                            const isActive = currentStep === step;
                            const isComplete = index < stepIndex;

                            return (
                                <li key={step} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : isComplete
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <span
                                        className={`ml-2 text-sm sm:text-base font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
                                            }`}
                                    >
                                        {step === 'context' && 'Context'}
                                        {step === 'upload' && 'Upload'}
                                        {step === 'results' && 'Results'}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`hidden sm:block w-16 h-0.5 mx-4 ${isComplete ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* Step Content */}
                <main className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                    {currentStep === 'context' && (
                        <ContextStep onSubmit={handleContextSubmit} />
                    )}

                    {currentStep === 'upload' && (
                        <UploadStep
                            onUploadComplete={handleUploadComplete}
                            isAnalyzing={isAnalyzing}
                            onBack={() => setCurrentStep('context')}
                            contextData={contextData}
                        />
                    )}

                    {currentStep === 'results' && report && (
                        <ResultsStep report={report} onReset={handleReset} />
                    )}
                </main>
            </div>
        </div>
    );
}
