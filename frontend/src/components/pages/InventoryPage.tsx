import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Beaker, DollarSign, ListOrdered, AlertTriangle, SortAsc, SortDesc } from 'lucide-react'
import { ActionConfirmationModal } from '../common/CommonModals'
import ApiSearchModal from './ApiSearchModal'
import InventoryMasterTable from './InventoryMasterTable'
import StockManagementTable from './StockManagementTable'
import { ingredientsApi } from '../../services/api/ingredients'
import useDataStore from '../../stores/useDataStore'
import useAppStore from '../../stores/useAppStore'
import { getInStockIngredients, getLowStockIngredients, getActiveIngredients } from '../../utils/ingredientsUtils'
import { toast } from 'react-toastify'

const InventoryPage: React.FC = () => {
      const [removeFromStockId, setRemoveFromStockId] = useState<string | null>(null)
      const [removeFromStockWarning, setRemoveFromStockWarning] = useState<string | null>(null)
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('')
    const [showOnlyLowStock, setShowOnlyLowStock] = useState(() => location.state?.showOnlyLowStock || false)
    // Forzar filtro si cambia forceFilter (aunque el objeto state sea igual)
    useEffect(() => {
      if (location.state?.showOnlyLowStock || location.state?.forceFilter) {
        setShowOnlyLowStock(true)
        if (location.state?.forceFilter) setSearchTerm('')
      }
    }, [location.state?.forceFilter])
  const { ingredients, recipes, setIngredients } = useDataStore()
  const { alertConfig, setAlertConfig } = useAppStore()
  const [activeTab, setActiveTab] = useState('stock')
  const [editingIngredient, setEditingIngredient] = useState<any>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isApiSearchOpen, setIsApiSearchOpen] = useState(false)
  const [deletingIngredient, setDeletingIngredient] = useState<any>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

  const [restockAmount, setRestockAmount] = useState('0')
  const [restockId, setRestockId] = useState<string | null>(null)
  const [removeStockId, setRemoveStockId] = useState<string | null>(null)
  // Ingredientes activos (no eliminados) para inventario
  const activeIngredients = useMemo(() => getActiveIngredients(ingredients), [ingredients])
  // Ingredientes en stock (no eliminados y en stock) para la vista de stock
  const inStockIngredients = useMemo(() => getInStockIngredients(ingredients), [ingredients])
  const lowStockAlert = useMemo(() => getLowStockIngredients(ingredients), [ingredients])

  const sortedIngredients = useCallback((data: any[]) => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      let aValue: any = a[sortConfig.key]
      let bValue: any = b[sortConfig.key]
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase()
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [sortConfig])

  // Stock: solo ingredientes en stock (no eliminados y isInStock true)
  const stockIngredients = useMemo(() => {
    let filtered = sortedIngredients(inStockIngredients)
    if (showOnlyLowStock) {
      filtered = filtered.filter(i => lowStockAlert.some(a => a.id === i.id))
    }
    if (searchTerm) {
      filtered = filtered.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    filtered = filtered.filter(i => !i.hiddenFromStock)
    if (sortConfig.key !== 'stock' && sortConfig.key !== 'reorderThreshold') {
      return filtered.sort((a, b) => {
        const aLow = Number(a.stock) < Number(a.reorderThreshold) ? 1 : 0
        const bLow = Number(b.stock) < Number(b.reorderThreshold) ? 1 : 0
        return bLow - aLow
      })
    }
    return filtered
  }, [inStockIngredients, sortConfig, sortedIngredients, searchTerm, showOnlyLowStock, lowStockAlert])

  // Inventario: todos los ingredientes no eliminados
  const inventoryIngredients = useMemo(() => {
    const filtered = sortedIngredients(activeIngredients)
    if (!searchTerm) return filtered
    return filtered.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [activeIngredients, sortedIngredients, searchTerm])

  const handleSaveIngredient = async (data: any) => {
    let createdOrUpdated = false;
    try {
      if (!data.id) {
        // Crear nuevo ingrediente vía API
        const created = await ingredientsApi.create(data);
        createdOrUpdated = true;
      } else {
        // Edición vía API
        const { id, ...updateData } = data;
        await ingredientsApi.update(id, updateData);
        createdOrUpdated = true;
      }
      toast.success(!data.id ? 'Ingrediente creado correctamente' : 'Ingrediente actualizado correctamente')
      // En vez de cerrar el form, resetearlo y dejarlo abierto
      setEditingIngredient(null); // Forzar reset de IngredientForm
      setTimeout(() => setIsFormOpen(true), 0); // Dejar el form abierto
    } catch (err) {
      toast.error(!data.id ? `Error al crear ingrediente, ${err.response?.data?.message || err.message}` :
         `Error al actualizar ingrediente, ${err.response?.data?.message || err.message}`)
    } finally {
      if (createdOrUpdated) {
        try {
          const all = await ingredientsApi.getAll()
          setIngredients(all)
        } catch (e) {
          toast.error('No se pudo actualizar el listado de ingredientes')
        }
      }
    }
  }
  
  const handleSoftDelete = (ingredient: any) => {
    setDeleteError(null)
    setDeletingIngredient(ingredient)
  }

  const confirmDelete = async () => {
    if (deletingIngredient) {
      try {
        await ingredientsApi.remove(deletingIngredient.id)
        setDeletingIngredient(null)
        toast.success('Ingrediente eliminado correctamente')
      } catch (error: any) {
        toast.error(`Error al eliminar ingrediente: ${error.response?.data?.message || error.message}`)
      } finally {
        try {
          const all = await ingredientsApi.getAll()
          setIngredients(all)
        } catch (e) {
          toast.error('No se pudo actualizar el listado de ingredientes')
        }
      }
    }
  }

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient); setIsFormOpen(true)
  }

  const handleCloseForm = () => { setEditingIngredient(undefined); setIsFormOpen(false) }

  // Cerrar el formulario si se cambia a la pestaña de gestión de stock
  React.useEffect(() => {
    if (activeTab !== 'inventory' && isFormOpen) {
      handleCloseForm()
    }
  }, [activeTab])

  const handleQuickRestock = async (id: string, amount: number) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;
    // Soporta stock como string o number
    const currentStock = typeof ing.stock === 'string' ? parseFloat(ing.stock) : (ing.stock || 0);
    const newStock = (currentStock + amount);
    try {
      await ingredientsApi.update(id, { stock: newStock });
      const all = await ingredientsApi.getAll();
      setIngredients(all);
      toast.success(`${amount > 0 ? 'Ingreso' : 'Egreso'} de stock realizado correctamente.`);
    } catch (e) {
      toast.error('Error al actualizar el stock en el backend.');
    }
  }

  const handleRestockCustom = async (id: string, amount: number) => {
    if (isNaN(amount) || amount === 0) { alert('Por favor, ingrese una cantidad válida y diferente de cero.'); return }
    await handleQuickRestock(id, amount);
    setRestockId(null); setRestockAmount('0');
  }

  const handleRemoveStockCustom = async (id: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) { alert('Por favor, ingrese una cantidad positiva y válida para quitar.'); return }
    await handleQuickRestock(id, -amount);
    setRemoveStockId(null); setRestockAmount('0');
  }

  const requestSort = (key: string) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; setSortConfig({ key, direction }) }
  const getSortIcon = (key: string) => { if (sortConfig.key !== key) return null; return sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" /> }

  const onRemoveFromStock = (id: string) => {
    const ing = ingredients.find(i => i.id === id)
    setRemoveFromStockId(id);
    if (ing && ing.stock > 0) {
      setRemoveFromStockWarning('Este ingrediente aún tiene stock. Si lo quitas, el stock se pondrá en 0 y el ingrediente ya no aparecerá en la vista de stock (solo en inventario). ¿Deseas continuar?');
    } else {
      setRemoveFromStockWarning('¿Estás seguro que deseas quitar este ingrediente del stock? Esta acción pondrá el stock en 0 y solo lo ocultará de la vista de stock, pero seguirá disponible en el inventario.');
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value)
            if (showOnlyLowStock) setShowOnlyLowStock(false)
          }}
          className="w-full max-w-xs p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
            {(showOnlyLowStock || searchTerm) && (
              <button
                className="ml-2 px-3 py-1 bg-indigo-500 text-white text-base font-bold rounded-lg hover:bg-indigo-600 transition shadow-lg"
                style={{ minWidth: 120 }}
                onClick={() => { setShowOnlyLowStock(false); setSearchTerm('') }}
              >
                Ver todos
              </button>
            )}
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Beaker className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/>
        Inventario y Stock
        <span className="relative ml-4">
          <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
          {lowStockAlert.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg">
              {lowStockAlert.length}
            </span>
          )}
        </span>
      </h1>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('stock')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'stock' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} flex items-center`}><DollarSign className="w-5 h-5 mr-1" /> Gestión de Stock</button>
          <button onClick={() => setActiveTab('inventory')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} flex items-center`}><ListOrdered className="w-5 h-5 mr-1" /> Inventario</button>
        </nav>
      </div>

      {/* Here we could render tabs and include InventoryMasterTable and StockManagementTable */}
      {activeTab === 'inventory' ? (
        <InventoryMasterTable isFormOpen={isFormOpen} editingIngredient={editingIngredient} handleSaveIngredient={handleSaveIngredient} handleCloseForm={handleCloseForm} inventoryIngredients={inventoryIngredients} requestSort={requestSort} getSortIcon={getSortIcon} handleEdit={handleEdit} handleSoftDelete={handleSoftDelete} setIsApiSearchOpen={setIsApiSearchOpen} setIsFormOpen={() => { setEditingIngredient(undefined); setIsFormOpen(true) }} />
      ) : (
        <>
          <StockManagementTable 
            setRestockId={setRestockId} restockId={restockId} stockIngredients={stockIngredients} lowStockAlert={lowStockAlert} 
            requestSort={requestSort} getSortIcon={getSortIcon} handleQuickRestock={handleQuickRestock} handleRestockCustom={handleRestockCustom} 
            setRestockAmount={setRestockAmount} restockAmount={restockAmount} removeStockId={removeStockId} setRemoveStockId={setRemoveStockId} 
            handleRemoveStockCustom={handleRemoveStockCustom} activeIngredients={stockIngredients}
            onRemoveFromStock={onRemoveFromStock}
          />
          {removeFromStockId && (
            <ActionConfirmationModal
              title="Confirmar quitar de stock"
              message={removeFromStockWarning || ''}
              actionText="Quitar de stock"
              onConfirm={async () => {
                const id = removeFromStockId;
                try {
                  // Buscar el ingrediente para obtener el stock actual
                  const ing = ingredients.find(i => i.id === id);
                  const a = await ingredientsApi.update(id, { isInStock: false as boolean, stock: 0 });
                  const all = await ingredientsApi.getAll();
                  setIngredients(all);
                  toast.info('El ingrediente fue quitado del stock y su stock fue puesto en 0. Ahora solo aparecerá en el inventario.');
                } catch (e) {
                  toast.error('Error al actualizar el ingrediente en el backend.');
                }
                setRemoveFromStockId(null);
                setRemoveFromStockWarning(null);
              }}
              onCancel={() => { setRemoveFromStockId(null); setRemoveFromStockWarning(null); }}
            />
          )}
        </>
      )}

      {isApiSearchOpen && (
        <ApiSearchModal onClose={() => setIsApiSearchOpen(false)} />
      )}

      {deletingIngredient && (
        <ActionConfirmationModal title="Confirmar Eliminación" message={`¿Estás seguro de que quieres eliminar el ingrediente ${deletingIngredient.name}?`} actionText="Eliminar" onConfirm={confirmDelete} onCancel={() => setDeletingIngredient(null)} integrityError={deleteError} />
      )}
    </div>
  )
}

export default InventoryPage
