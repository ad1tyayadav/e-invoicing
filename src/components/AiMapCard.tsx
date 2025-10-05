interface AIMappingCardProps {
    candidate: string;
    target: string;
    confidence: number;
    suggestion?: React.ReactNode;
}

export function AIMappingCard({ candidate, target, confidence, suggestion }: AIMappingCardProps) {
    return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="font-medium text-blue-800">{candidate} → {target}</div>
                    {suggestion && (
                        <div className="text-sm text-blue-700 mt-2 p-2 bg-white rounded border border-blue-100">
                            {suggestion}
                        </div>
                    )}
                </div>
                <div className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {Math.round(confidence * 100)}% match
                </div>
            </div>
        </div>
    );
}
