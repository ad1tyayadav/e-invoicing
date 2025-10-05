/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface UploadStepProps {
    onUploadComplete: (uploadId: string) => void;
    isAnalyzing: boolean;
    onBack: () => void;
    contextData: { country: string; erp: string };
}

export default function UploadStep({
    onUploadComplete,
    isAnalyzing,
    onBack,
    contextData,
}: UploadStepProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        if (selectedFile.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    setPreviewData(Array.isArray(data) ? data.slice(0, 20) : [data]);
                } catch {
                    toast.error('Invalid JSON file');
                }
            };
            reader.readAsText(selectedFile);
        } else {
            Papa.parse(selectedFile, {
                header: true,
                complete: (result) => {
                    setPreviewData((result.data as any[]).slice(0, 20));
                },
                error: () => toast.error('Error parsing CSV file'),
            });
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const uploadToast = toast.loading('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('country', contextData.country);
            formData.append('erp', contextData.erp);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const { uploadId } = await response.json();
            toast.success('File uploaded successfully! Analyzing...', {
                id: uploadToast,
            });
            onUploadComplete(uploadId);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed. Please try again.', {
                id: uploadToast,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getTypeBadge = (value: any) => {
        if (value === null || value === undefined || value === '') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    Empty
                </span>
            );
        }

        const numValue = Number(value);
        if (!isNaN(numValue)) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Number
                </span>
            );
        }

        if (
            typeof value === 'string' &&
            (value.match(/\d{4}-\d{2}-\d{2}/) || value.match(/\d{1,2}\/\d{1,2}\/\d{4}/))
        ) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Date
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                Text
            </span>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Invoice Data</h2>

            <div className="space-y-6">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload CSV or JSON File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                        <input
                            type="file"
                            accept=".csv,.json"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block">
                            <p className="text-gray-600">
                                <span className="text-blue-600 font-semibold">Choose a file</span> or drag & drop here
                            </p>
                            <p className="text-xs text-gray-500 mt-1">CSV or JSON files up to 5MB</p>
                        </label>
                    </div>
                    {file && (
                        <p className="mt-2 text-sm text-gray-600">
                            Selected: <span className="font-medium">{file.name}</span> ({file.size.toLocaleString()} bytes)
                        </p>
                    )}
                </div>

                {/* Preview Table */}
                {previewData.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Data Preview (First 20 rows)
                        </h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {Object.keys(previewData[0]).map((key) => (
                                            <th
                                                key={key}
                                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                                            >
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {previewData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {Object.entries(row).map(([key, value], cellIndex) => (
                                                <td key={cellIndex} className="px-4 py-2 text-gray-900 align-top">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="truncate max-w-xs">{String(value || '')}</span>
                                                        {getTypeBadge(value)}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Back
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading || isAnalyzing}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isUploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Upload & Analyze'}
                    </button>
                </div>
            </div>
        </div>
    );
}
