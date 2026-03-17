import React from 'react';
import { Maximize2, RotateCcw } from 'lucide-react';

interface ScaleRecipeModalProps {
  isOpen: boolean;
  batchLiters: number;
  newBatchSize: number | null;
  setNewBatchSize: (v: number | null) => void;
  onCancel: () => void;
  onScale: () => void;
}

const ScaleRecipeModal: React.FC<ScaleRecipeModalProps> = ({
  isOpen,
  batchLiters,
  newBatchSize,
  setNewBatchSize,
  onCancel,
  onScale,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
          <Maximize2 className="w-6 h-6 mr-2"/> Escalar Receta
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          El batch actual es de <span className="font-bold text-indigo-600 dark:text-indigo-400">{batchLiters} L</span>.
        </p>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nuevo Tamaño de Batch (Litros)</label>
        <input
          type="number"
          step="1"
          value={newBatchSize ?? ''}
          onChange={e => setNewBatchSize(e.target.value === '' ? null : parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancelar
          </button>
          <button onClick={onScale} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">
            <RotateCcw className="w-4 h-4 mr-2 inline"/> Escalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScaleRecipeModal;
