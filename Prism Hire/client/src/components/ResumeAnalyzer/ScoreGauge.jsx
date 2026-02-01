import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ScoreGauge = ({ score, size = 200 }) => {
    // Determine color based on score
    const getColor = (score) => {
        if (score >= 75) return '#10b981'; // green
        if (score >= 50) return '#f59e0b'; // yellow/orange
        return '#ef4444'; // red
    };

    const color = getColor(score);
    const emptyColor = '#374151'; // gray-700 for dark mode

    // Data for the pie chart (score vs remaining)
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score }
    ];

    return (
        <div className="relative inline-block">
            <ResponsiveContainer width={size} height={size}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius="70%"
                        outerRadius="90%"
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={color} />
                        <Cell fill={emptyColor} />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Score text in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold" style={{ color }}>
                    {score}
                </div>
                <div className="text-sm text-gray-400 font-medium">out of 100</div>
            </div>
        </div>
    );
};

export default ScoreGauge;
