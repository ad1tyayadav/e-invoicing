interface CoverageCardProps {
    count: number;
    label: string;
    description: string;
    color: 'green' | 'yellow' | 'red';
}

export function CoverageCard({ count, label, description, color }: CoverageCardProps) {
    const colors = {
        green: ['text-green-600', 'text-green-800', 'bg-green-50', 'border-green-200'],
        yellow: ['text-yellow-600', 'text-yellow-800', 'bg-yellow-50', 'border-yellow-200'],
        red: ['text-red-600', 'text-red-800', 'bg-red-50', 'border-red-200'],
    };

    const [text, textDark, bg, border] = colors[color];

    return (
        <div className={`${bg} p-4 rounded-lg border ${border} text-center`}>
            <div className={`text-2xl font-bold ${text}`}>{count}</div>
            <div className={`text-sm font-medium ${textDark} mt-1`}>{label}</div>
            <div className={`text-xs ${text} mt-1`}>{description}</div>
        </div>
    );
}
