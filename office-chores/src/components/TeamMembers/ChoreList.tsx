import React from 'react';
import { format, parseISO, isPast, startOfDay } from 'date-fns';
import type { Chore } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChoreListProps {
  chores: Chore[];
}

export const ChoreList: React.FC<ChoreListProps> = ({ chores }) => {
  const { toggleChoreCompletion } = useApp();

  if (chores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No chores to display</p>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const isOverdue = (chore: Chore): boolean => {
    if (!chore.endDate) return false;
    try {
      const endDate = parseISO(chore.endDate);
      return isPast(startOfDay(endDate));
    } catch {
      return false;
    }
  };

  return (
    <ul className="space-y-3" role="list">
      {chores.map((chore) => {
        const overdue = isOverdue(chore);

        return (
          <li
            key={chore.id}
            className={`p-4 border rounded-lg ${
              chore.isCompleted
                ? 'border-green-200 bg-green-50'
                : overdue
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <button
                onClick={() => toggleChoreCompletion(chore.id)}
                className="mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-indigo-500 transition-colors flex items-center justify-center"
                aria-label={chore.isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {chore.isCompleted && (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <h4 className={`font-semibold ${chore.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {chore.title}
                </h4>
                {chore.description && (
                  <p className={`text-sm mt-1 ${chore.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {chore.description}
                  </p>
                )}
                <div className="flex gap-3 mt-2 text-sm text-gray-500">
                  {chore.isRecurring && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      Recurring
                    </span>
                  )}
                  {chore.isCompleted && chore.completedAt && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      ✓ Completed {formatDate(chore.completedAt)}
                    </span>
                  )}
                  {chore.startDate && (
                    <span>Start: {formatDate(chore.startDate)}</span>
                  )}
                  {chore.endDate && (
                    <span>Due: {formatDate(chore.endDate)}</span>
                  )}
                </div>
              </div>
              {overdue && !chore.isCompleted && (
                <span className="ml-2 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                  Overdue
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
