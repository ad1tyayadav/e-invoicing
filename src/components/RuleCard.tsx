interface RuleCardProps {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: string | number;
  got?: string | number;
  value?: string;
  explanation?: string | boolean;
}

export function RuleCard({ rule, ok, exampleLine, expected, got, value, explanation }: RuleCardProps) {
    const badgeColor = ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <div className={`p-4 rounded-lg border ${badgeColor}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <span className="font-medium text-gray-900">{rule}</span>
                    {!ok && (
                        <div className="text-sm text-gray-600 mt-1">
                            {exampleLine && `Line ${exampleLine} • `}
                            {expected && `Expected: ${expected}`}
                            {got && ` • Got: ${got}`}
                            {value && ` • Value: "${value}"`}
                        </div>
                    )}
                    {!ok && explanation && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-start space-x-2">
                            <span>🔧</span>
                            <span>{explanation}</span>
                        </div>
                    )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                    {ok ? 'PASS' : 'FAIL'}
                </span>
            </div>
        </div>
    );
}
