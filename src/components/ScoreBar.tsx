interface ScoreBarProps {
  label: string;
  score: number;
  weight?: string;
}

export function ScoreBar({ label, score, weight }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-32 text-sm font-medium text-gray-700">
        {label}
        {weight && <span className="text-gray-500 text-xs block">Weight: {weight}</span>}
      </div>
      <div className="flex-1 bg-gray-200 rounded-full h-4">
        <div className={`h-4 rounded-full ${getColor(score)}`} style={{ width: `${score}%` }} />
      </div>
      <div className="w-12 text-right text-sm font-medium text-gray-700">{score}%</div>
    </div>
  );
}
