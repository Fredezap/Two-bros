import React from 'react';
import { ActionConfirmationModal } from '../../common/CommonModals';

interface DeleteConfirmationModalProps {
  deletingRecipe: any;
  confirmDelete: () => void;
  setDeletingRecipe: (v: any) => void;
  deleteError: any;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  deletingRecipe,
  confirmDelete,
  setDeletingRecipe,
  deleteError,
}) => {
  if (!deletingRecipe) return null;
  return (
    <ActionConfirmationModal
      title="Confirmar Eliminación"
      message={`¿Estás seguro de que quieres eliminar la receta ${deletingRecipe.name}? Esta acción no se puede deshacer.`}
      actionText="Eliminar Receta"
      onConfirm={confirmDelete}
      onCancel={() => setDeletingRecipe(null)}
      integrityError={deleteError}
    />
  );
};

export default DeleteConfirmationModal;
