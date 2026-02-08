
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type MarkRecord } from '../types';

interface StudentChartProps {
  marks: MarkRecord[];
}

const processData = (marks: MarkRecord[]) => {
    const dataByMonth: { [key: string]: { month: string; [subject: string]: number | string } } = {};
    const subjects = [...new Set(marks.map(m => m.subject))];

    marks.forEach(mark => {
        if (!dataByMonth[mark.month]) {
            dataByMonth[mark.month] = { month: mark.month };
        }
        dataByMonth[mark.month][mark.subject] = mark.marks;
    });

    return { data: Object.values(dataByMonth), subjects };
};


export const StudentChart: React.FC<StudentChartProps> = ({ marks }) => {
  const { data, subjects } = processData(marks);
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 h-96">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <span className="mr-2">📈</span> Monthly Performance
        </h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 25,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis domain={[0, 100]} stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {subjects.map((subject, index) => (
                <Line key={subject} type="monotone" dataKey={subject} stroke={colors[index % colors.length]} strokeWidth={2} activeDot={{ r: 6, strokeWidth: 2 }} />
            ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};