export const DatePickerModal: React.FC<{
  title: string
  initialDate?: Date
  onConfirm: (date: Date) => void
  onCancel: () => void
}> = ({ title, initialDate, onConfirm, onCancel }) => {
  const [date, setDate] = useState(() => {
    if (initialDate) return initialDate.toISOString().substring(0, 10)
    return new Date().toISOString().substring(0, 10)
  })
  // Cerrar modal al hacer click fuera del contenido
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel()
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">{title}</h3>
        <div className="mb-6">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancelar
          </button>
          <button onClick={() => onConfirm(new Date(date))} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, XCircle, Check } from 'lucide-react'

export const ActionConfirmationModal: React.FC<{ title: string; message?: string; actionText: string; onConfirm: () => void; onCancel: () => void; integrityError?: string | null }> = ({ title, message, actionText, onConfirm, onCancel, integrityError }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
          {title === 'Confirmar Eliminación' && <Trash2 className="w-6 h-6 mr-2" />}
          {title === 'Confirmar Cancelación' && <XCircle className="w-6 h-6 mr-2" />}
          {title === 'Confirmar Finalización' && <Check className="w-6 h-6 mr-2" />}
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition shadow-md ${actionText.includes('Eliminar') ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  )
}

export const SectionContainer: React.FC<{ title: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
)

export const IngredientAdder: React.FC<{ availableIngredients: any[]; onAdd: (id: string, type: string) => void; addButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement> }> = ({ availableIngredients, onAdd, addButtonProps }) => {
  const [selectedId, setSelectedId] = useState(() => availableIngredients[0]?.id || '')

  useEffect(() => {
    const isCurrentIdValid = availableIngredients.some(i => i.id === selectedId)
    if (availableIngredients.length > 0 && !isCurrentIdValid) {
      setSelectedId(availableIngredients[0].id)
    } else if (availableIngredients.length === 0 && selectedId !== '') {
      setSelectedId('')
    }
  }, [availableIngredients, selectedId])

  const handleAdd = () => {
    const ingredient = availableIngredients.find(i => i.id === selectedId)
    if (ingredient) onAdd(ingredient.id, ingredient.type)
  }

  if (availableIngredients.length === 0) return <p className="text-sm text-red-500 mt-2">No hay ingredientes disponibles de este tipo.</p>

  return (
    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {availableIngredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unitOfMeasure.toUpperCase()})</option>)}
      </select>
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition shadow-md"
        {...addButtonProps}
      >
        <Plus className="w-4 h-4 inline mr-1"/> Añadir
      </button>
    </div>
  )
}

export const IngredientForm: React.FC<{ ingredient?: any; onClose: () => void; onSave: (data: any) => void }> = ({ ingredient, onClose, onSave }) => {
  const UNIT_OPTIONS = [
    { value: 'g', label: 'Gramos (g)' },
    { value: 'l', label: 'Litros (l)' },
  ];
  const getUnit = (t: string) => (t === 'malt' || t === 'hop' || t === 'yeast') ? 'g' : 'l'
  const [name, setName] = useState(ingredient?.name || '')
  const [type, setType] = useState(ingredient?.type || 'malt')
  const [unitOfMeasure, setUnitOfMeasure] = useState(() => ingredient?.unitOfMeasure || getUnit(ingredient?.type || 'malt'))
  const [stock, setStock] = useState(
    ingredient && typeof ingredient.stock !== 'undefined' && ingredient.stock !== null
      ? ingredient.stock.toString()
      : ''
  )
  const [reorderThreshold, setReorderThreshold] = useState(
    ingredient && typeof ingredient.reorderThreshold !== 'undefined' && ingredient.reorderThreshold !== null
      ? ingredient.reorderThreshold.toString()
      : ''
  )

  // Sincronizar los valores cuando cambia ingredient
  React.useEffect(() => {
    setName(ingredient?.name || '')
    setType(ingredient?.type || 'malt')
    setUnitOfMeasure(ingredient?.unitOfMeasure || getUnit(ingredient?.type || 'malt'))
    setStock(
      ingredient && typeof ingredient.stock !== 'undefined' && ingredient.stock !== null
        ? ingredient.stock.toString()
        : ''
    )
    setReorderThreshold(
      ingredient && typeof ingredient.reorderThreshold !== 'undefined' && ingredient.reorderThreshold !== null
        ? ingredient.reorderThreshold.toString()
        : ''
    )
  }, [ingredient])

  const handleTypeChange = (newType: string) => { setType(newType); setUnitOfMeasure(getUnit(newType)) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsedStock = stock === '' ? 0 : parseFloat(stock);
      if (parsedStock < 0) {
        alert('El stock no puede ser negativo.');
        return;
      }
      onSave({
        id: ingredient?.id,
        name,
        type,
        unitOfMeasure,
        stock: parsedStock,
        reorderThreshold: reorderThreshold === '' ? 0 : parseFloat(reorderThreshold),
        isInStock: parsedStock > 0
      })
      // El cierre del modal lo maneja InventoryPage según éxito o error
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white dark:bg-gray-800 mb-10 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 border-b pb-2">{ingredient ? 'Editar un ingrediente' : 'Agregar un nuevo ingrediente'}</h2>
      <div>
        <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
        <input id="ingredient-name" type="text" placeholder="Ej. Malta Pale Ale" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ingredient-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select id="ingredient-type" value={type} onChange={e => handleTypeChange(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {['malt', 'hop', 'yeast', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ingredient-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad</label>
          <select id="ingredient-unit" value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="ingredient-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock inicial</label>
        <input
          id="ingredient-stock"
          type="number"
          step="0.01"
          placeholder={`Stock inicial (${unitOfMeasure.toUpperCase()})`}
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          disabled={ingredient && Number(ingredient.stock) > 0}
        />
        {ingredient && Number(ingredient.stock) > 0 && (
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            El stock solo se puede modificar desde la pestaña <b>Stock</b>.
          </div>
        )}
      </div>

      <div>
        <label htmlFor="ingredient-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Umbral de alerta</label>
        <input
          id="ingredient-threshold"
          type="number"
          step="0.01"
          placeholder={`Umbral de alerta (${unitOfMeasure.toUpperCase()})`}
          value={reorderThreshold}
          onChange={e => setReorderThreshold(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md">Guardar</button>
      </div>
    </form>
  )
}

export default null as any
