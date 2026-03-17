import React from 'react';
import { ChevronLeft } from 'lucide-react';
import ActionButtons from '../common/ActionButtons';
import StatusMessage from '../common/StatusMessage';
import StockCheckModal from '../common/StockCheckModal';

interface RecipeFormHeaderProps {
  onClose: () => void;
  isCreating: boolean;
  isEditing: boolean;
  isReadyToCook: boolean;
  onClone: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCook: () => void;
  onDelete: () => void;
  statusMessage: { type: string; message: string } | null;
  showStockCheck: boolean;
  stockCheckResult: any[] | null;
  showForceWarning: boolean;
  setShowStockCheck: (show: boolean) => void;
  setShowForceWarning: (show: boolean) => void;
  confirmCook: (force: boolean) => void;
}

const RecipeFormHeader: React.FC<RecipeFormHeaderProps> = ({
  onClose,
  isCreating,
  isEditing,
  isReadyToCook,
  onClone,
  onSave,
  onStartEdit,
  onCancelEdit,
  onCook,
  onDelete,
  statusMessage,
  showStockCheck,
  stockCheckResult,
  showForceWarning,
  setShowStockCheck,
  setShowForceWarning,
  confirmCook,
}) => (
  <>
    <header className="bg-white dark:bg-gray-800 p-6 rounded-t-xl shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="relative flex justify-center items-center">
        <button onClick={onClose} className="absolute left-0 p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </header>
    <div className="p-6 md:p-8">
      <ActionButtons
        isCreating={isCreating}
        isEditing={isEditing}
        isReadyToCook={isReadyToCook}
        onClone={onClone}
        onSave={onSave}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onCook={onCook}
        onDelete={onDelete}
      />
      {statusMessage && (
        <StatusMessage type={statusMessage.type as any} message={statusMessage.message} />
      )}
      <StockCheckModal
        show={showStockCheck}
        stockCheckResult={stockCheckResult}
        showForceWarning={showForceWarning}
        setShowStockCheck={setShowStockCheck}
        setShowForceWarning={setShowForceWarning}
        confirmCook={confirmCook}
      />
    </div>
  </>
);

export default RecipeFormHeader;
