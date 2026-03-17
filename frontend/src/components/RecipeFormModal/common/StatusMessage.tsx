import React from 'react';

interface StatusMessageProps {
  type: 'success' | 'warning' | 'error';
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  const baseClass = 'm-4 p-3 rounded-lg';
  const typeClass =
    type === 'success'
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : type === 'warning'
      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  return <div className={`${baseClass} ${typeClass}`}>{message}</div>;
};

export default StatusMessage;
