
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
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-96">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Performance</h3>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {subjects.map((subject, index) => (
                <Line key={subject} type="monotone" dataKey={subject} stroke={colors[index % colors.length]} activeDot={{ r: 8 }} />
            ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};
// these is nikhil i am changng  or adding this line in these code.