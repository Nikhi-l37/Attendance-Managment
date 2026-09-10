
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-slate-700 group gradient-border animate-slideInUp">
      <div className="flex items-center">
        <div className={`p-4 rounded-xl mr-4 ${color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1 group-hover:scale-110 transition-transform duration-300 inline-block">{value}</p>
        </div>
      </div>
      <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 mt-4 rounded-full ${color}`}></div>
    </div>
  );
};
