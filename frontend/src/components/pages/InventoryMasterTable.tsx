import React, { useRef, useEffect } from 'react'
import { Plus, Trash2, Edit, Search, Beaker, FlaskConical } from 'lucide-react'
import { BarleyIcon, HopFlowerIcon } from '../common/Icons'
import { IngredientForm } from '../common/CommonModals'

type Ingredient = any

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'malt': return <BarleyIcon className="w-5 h-5"/>
    case 'hop': return <HopFlowerIcon className="w-5 h-5"/>
    case 'yeast': return <FlaskConical className="w-5 h-5 text-red-600 dark:text-red-400" />
    default: return <Beaker className="w-5 h-5 text-gray-600 dark:text-gray-400" />
  }
}

type Props = {
  inventoryIngredients: Ingredient[]
  requestSort: (key: string) => void
  getSortIcon: (key: string) => React.ReactNode
  handleEdit: (i: Ingredient) => void
  handleSoftDelete: (i: Ingredient) => void
  setIsApiSearchOpen: (v: boolean) => void
  setIsFormOpen: (v: boolean) => void
  isFormOpen: boolean
  editingIngredient: Ingredient | null
  handleSaveIngredient: (data: any) => void
  handleCloseForm: () => void
}

const InventoryMasterTable: React.FC<Props> = ({ isFormOpen, editingIngredient, handleSaveIngredient, handleCloseForm, inventoryIngredients, requestSort, getSortIcon, handleEdit, handleSoftDelete, setIsApiSearchOpen, setIsFormOpen }) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Cuando se abre el formulario (edit o agregar), hacer scroll
  useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFormOpen, editingIngredient]);

  // Envolver handleEdit para centrar el formulario

  // Al agregar manual, limpiar el formulario
  const handleAddManual = () => {
    handleEdit(null); // InventoryPage se encarga de abrir el form y limpiar
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Al editar, solo pasar el ingrediente a editar
  const handleEditAndScroll = (i: Ingredient) => {
    handleEdit(i); // InventoryPage se encarga de abrir el form y setear el ingrediente
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <>
      <div className="flex justify-end space-x-3 mb-4">
        <button 
          onClick={() => setIsApiSearchOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md text-sm">
          <Search className="w-5 h-5 mr-2" />
                  Buscar en API
        </button>
        <button 
          onClick={handleAddManual}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md text-sm">
          <Plus className="w-5 h-5 mr-2" />
            Agregar Manual
        </button>
      </div>
      {isFormOpen && (
        <div ref={formRef}>
          <IngredientForm 
            key={editingIngredient ? editingIngredient.id || 'edit' : `new-${Date.now()}`}
            ingredient={editingIngredient} 
            onSave={handleSaveIngredient} 
            onClose={handleCloseForm} 
          />
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                              Nombre {getSortIcon('name')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('type')}>
                              Tipo {getSortIcon('type')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad (g/l)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Umbral</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {inventoryIngredients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300">
                  Aún no se han agregado ingredientes al inventario.
                </td>
              </tr>
            ) : (
              inventoryIngredients.map((i) => (
                <tr key={i.id} className={'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                    {i.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    <span className="inline-flex items-center text-xs font-semibold">
                      {getTypeIcon(i.type)}
                      <span className="ml-1">{i.type.charAt(0).toUpperCase() + i.type.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    {i.unitOfMeasure.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    {(typeof i.reorderThreshold === 'number' ? i.reorderThreshold.toFixed(2) : (i.reorderThreshold ? Number(i.reorderThreshold).toFixed(2) : '-'))} {i.unitOfMeasure?.toUpperCase?.()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button onClick={() => handleEditAndScroll(i)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:bg-indigo-50 dark:hover:bg-gray-700 transition p-1 rounded-full">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleSoftDelete(i)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:bg-red-50 dark:hover:bg-gray-700 transition p-1 rounded-full">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {(!i.isInStock && (!i.stock || i.stock === 0)) && (
                      <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition" onClick={() => handleEditAndScroll(i)}>
                        Agregar a stock
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InventoryMasterTable
