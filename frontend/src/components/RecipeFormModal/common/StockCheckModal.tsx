import React from 'react';

interface StockCheckModalProps {
  show: boolean;
  stockCheckResult: Array<any>;
  showForceWarning: boolean;
  setShowStockCheck: (show: boolean) => void;
  setShowForceWarning: (show: boolean) => void;
  confirmCook: (force: boolean) => void;
}

const StockCheckModal: React.FC<StockCheckModalProps> = ({
  show,
  stockCheckResult,
  showForceWarning,
  setShowStockCheck,
  setShowForceWarning,
  confirmCook,
}) => {
  if (!show || !stockCheckResult) return null;

  return (
    <div className="m-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg relative">
      <button onClick={() => setShowStockCheck(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">×</button>
      <h3 className="text-lg font-bold mb-2">Estado de Stock para esta Cocción</h3>
      <ul className="space-y-2">
        {stockCheckResult.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.ok ? (
              <span className="text-green-600">✔️</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
            <span className="font-semibold">{item.name}</span>:
            <span>{item.requerido} {item.unidad} necesarios</span>
            <span className="mx-2">|</span>
            <span className={item.ok ? 'text-green-700' : 'text-red-700'}>
              {item.disponible} {item.unidad} en stock
            </span>
          </li>
        ))}
      </ul>
      {stockCheckResult.some(item => !item.ok) && !showForceWarning && (
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setShowStockCheck(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
          <button onClick={() => setShowForceWarning(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">Forzar Cocción</button>
        </div>
      )}
      {stockCheckResult.every(item => item.ok) && (
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setShowStockCheck(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
          <button onClick={() => confirmCook(false)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition">Confirmar Cocción</button>
        </div>
      )}
      {showForceWarning && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <p className="font-bold mb-2">¡Atención!</p>
          <p>El stock de los ingredientes insuficientes quedará en negativo si continúas.</p>
          <ul className="mt-2 mb-2 list-disc list-inside">
            {stockCheckResult.filter(item => !item.ok).map((item, idx) => (
              <li key={idx}>{item.name}: faltan {item.requerido - item.disponible} {item.unidad}</li>
            ))}
          </ul>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setShowForceWarning(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
            <button onClick={() => confirmCook(true)} className="px-4 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition">Confirmar y Forzar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCheckModal;
