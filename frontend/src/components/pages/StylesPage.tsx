import React, { useState, useMemo } from 'react'
import { ListOrdered, Plus, Edit, Trash2 } from 'lucide-react'
import * as logic from '../../services/logic'
import stylesApi from '../../services/api/styles'
import { toast } from 'react-toastify';
import { ActionConfirmationModal } from '../common/CommonModals'
import useDataStore from '../../stores/useDataStore'


const StylesPage: React.FC = () => {
  const { styles, recipes, setStyles } = useDataStore();
  const [editingStyle, setEditingStyle] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingStyle, setDeletingStyle] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const activeStyles = useMemo(() => styles.filter(s => s.deletedAt === null), [styles]);

  const handleSaveStyle = async (name: string, id?: string) => {
    try {
      let updatedStyle;
      if (id) {
        updatedStyle = await stylesApi.update(id, { name });
      } else {
        updatedStyle = await stylesApi.create({ name });
      }
      if (id) {
        setStyles(styles.map(s => s.id === updatedStyle.id ? updatedStyle : s));
        toast.success('Estilo actualizado correctamente');
      } else {
        setStyles([...styles, updatedStyle]);
        toast.success('Estilo creado correctamente');
      }
      setIsFormOpen(false);
      setEditingStyle(null);
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message || error.message || 'Error al guardar el estilo';
      toast.error(backendMsg);
      setIsFormOpen(false);
      setEditingStyle(null);
    }
  };

  const handleSoftDelete = (style: any) => {
    setDeleteError(null);
    setDeletingStyle(style);
  };

  const confirmDelete = () => {
    if (deletingStyle) {
      stylesApi.remove(deletingStyle.id)
        .then(() => {
          setStyles(styles.filter(s => s.id !== deletingStyle.id));
          setDeletingStyle(null);
          toast.success('Estilo eliminado correctamente');
        })
        .catch((error: any) => {
          const backendMsg = error?.response?.data?.message || error.message || 'Error deleting style';
          toast.error(backendMsg);
          setDeletingStyle(null);
        });
    }
  };

  const StyleForm: React.FC<any> = ({ style, onClose, onSave }) => {
    const [name, setName] = useState(style?.name || '');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(name, style?.id);
    };
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
        <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="p-4 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner max-w-sm w-full">
          <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 border-b pb-2">{style ? 'Editar Estilo' : 'Crear Nuevo Estilo'}</h3>
          <input type="text" placeholder="Nombre del Estilo (ej. IPA)" required value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md">Guardar</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center"><ListOrdered className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/> Estilos</h1>
        <button onClick={() => { setIsFormOpen(true); setEditingStyle(null); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"><Plus className="w-5 h-5 mr-2" /> Agregar Estilo</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {activeStyles.length === 0 ? (
          <div className="p-8 flex justify-center">
            <p className="text-gray-700 dark:text-gray-300 italic">Aún no hay estilos registrados.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre del Estilo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {activeStyles.map((s: any) => (
                <tr key={s.id} className={'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => { setEditingStyle(s); setIsFormOpen(true); }} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleSoftDelete(s)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {(isFormOpen || editingStyle) && (
        <StyleForm style={editingStyle} onClose={() => { setIsFormOpen(false); setEditingStyle(null); }} onSave={handleSaveStyle} />
      )}
      {deletingStyle && (
        <ActionConfirmationModal title="Confirmar Eliminación" message={`¿Estás seguro de que quieres eliminar el estilo ${deletingStyle.name}? Si tiene recetas asociadas, la acción fallará.`} actionText="Eliminar Estilo" onConfirm={confirmDelete} onCancel={() => setDeletingStyle(null)} integrityError={deleteError} />
      )}
    </div>
  );
};

export default StylesPage;
