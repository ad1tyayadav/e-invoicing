'use client';

import { useState } from 'react';
import RecentReports from './RecentReports';

interface ContextStepProps {
    onSubmit: (data: { country: string; erp: string }) => void;
}

export default function ContextStep({ onSubmit }: ContextStepProps) {
    const [formData, setFormData] = useState({ country: '', erp: '' });
    const [showRecent, setShowRecent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.country || !formData.erp) {
            alert('Please fill in all fields');
            return;
        }
        onSubmit(formData);
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Main Form */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                    Context Information
                </h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Tell us about your environment to help us provide better analysis.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Country
                        </label>
                        <select
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleChange('country', e.target.value)}
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a country</option>
                            <option value="UAE">United Arab Emirates</option>
                            <option value="KSA">Saudi Arabia</option>
                            <option value="MY">Malaysia</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="erp"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            ERP System
                        </label>
                        <select
                            id="erp"
                            value={formData.erp}
                            onChange={(e) => handleChange('erp', e.target.value)}
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select an ERP</option>
                            <option value="SAP">SAP</option>
                            <option value="Oracle">Oracle</option>
                            <option value="Microsoft">Microsoft Dynamics</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShowRecent(!showRecent)}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                            {showRecent ? 'Hide Recent Reports' : 'Show Recent Reports'}
                        </button>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                        >
                            Continue to Upload
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Reports Sidebar */}
            {showRecent && (
                <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Reports
                    </h3>
                    <RecentReports />
                </div>
            )}
        </div>
    );
}
