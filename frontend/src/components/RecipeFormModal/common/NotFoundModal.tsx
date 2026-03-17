import React from 'react';

interface NotFoundModalProps {
  show: boolean;
  onClose: () => void;
}

const NotFoundModal: React.FC<NotFoundModalProps> = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={onClose}>
      <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full my-8" onClick={e => e.stopPropagation()}>
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Receta no encontrada</h1>
        <button onClick={onClose} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Volver a Mis Recetas</button>
      </div>
    </div>
  );
};

export default NotFoundModal;
