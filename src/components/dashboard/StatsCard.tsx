import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-200 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-200 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-200 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-200 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  change.type === 'decrease'
                    ? 'bg-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                )}
              >
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                vs {change.period}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;