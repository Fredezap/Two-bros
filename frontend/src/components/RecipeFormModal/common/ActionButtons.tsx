import React from 'react';
import { X, Save, Edit, SquarePen, Utensils, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  isCreating: boolean;
  isEditing: boolean;
  isReadyToCook: boolean;
  onClone: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCook: () => void;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isCreating,
  isEditing,
  isReadyToCook,
  onClone,
  onSave,
  onStartEdit,
  onCancelEdit,
  onCook,
  onDelete,
}) => (
  <div className="mb-8 flex flex-wrap gap-3 justify-end">
    {!isCreating && (
      <button onClick={onClone} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
        <SquarePen className="w-5 h-5 mr-2" /> CLONAR
      </button>
    )}
    {(isEditing || isCreating) && (
      <button onClick={onSave} className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md">
        <Save className="w-5 h-5 mr-2" /> GUARDAR RECETA
      </button>
    )}
    {!isCreating && (
      <button
        onClick={isEditing ? onCancelEdit : onStartEdit}
        className={`flex items-center px-4 py-2 font-semibold rounded-lg transition shadow-md \
          ${isEditing ? 'bg-gray-400 text-gray-800 hover:bg-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {isEditing ? (
          <><X className="w-5 h-5 mr-2" /> Cancelar Edición</>
        ) : (
          <><Edit className="w-5 h-5 mr-2" /> Editar</>
        )}
      </button>
    )}
    {isReadyToCook && (
      <button onClick={onCook} className="flex items-center px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition shadow-md">
        <Utensils className="w-5 h-5 mr-2" /> COCINAR (Iniciar Brew)
      </button>
    )}
    {!isCreating && (
      <button onClick={onDelete} className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md">
        <Trash2 className="w-5 h-5 mr-2" /> ELIMINAR
      </button>
    )}
  </div>
);

export default ActionButtons;
