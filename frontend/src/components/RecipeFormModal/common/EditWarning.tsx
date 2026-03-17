import React from 'react';

interface EditWarningProps {
  show: boolean;
}

const EditWarning: React.FC<EditWarningProps> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
      Edición de ingredientes bloqueada.
    </div>
  );
};

export default EditWarning;
