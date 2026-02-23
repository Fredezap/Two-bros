import React from 'react'
import { AlertTriangle, Plus, Minimize2 } from 'lucide-react'
import StockAlert from './StockAlert'

type Ingredient = any

type Props = {
  setRestockId: (id: string | null) => void
  restockId: string | null
  stockIngredients: Ingredient[]
  lowStockAlert: Ingredient[]
  requestSort: (key: string) => void
  getSortIcon: (key: string) => React.ReactNode
  handleQuickRestock: (id: string, amount: number) => void
  handleRestockCustom: (id: string, amount: number) => void
  setRestockAmount: (v: string) => void
  restockAmount: string
  removeStockId: string | null
  setRemoveStockId: (id: string | null) => void
  handleRemoveStockCustom: (id: string, amount: number) => void
  activeIngredients: Ingredient[]
  onRemoveFromStock: (id: string) => void
}

const StockModal: React.FC<any> = ({ isAdd, onClose, onConfirm, currentId, restockAmount, setRestockAmount, activeIngredients }) => {
  const title = isAdd ? 'Ingresar Stock' : 'Quitar Stock'
  const buttonText = isAdd ? 'Confirmar Ingreso' : 'Confirmar Quitar'
  const Icon = isAdd ? Plus : Minimize2
  const activeIngredient = activeIngredients.find((i: any) => i.id === currentId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
        <h3 className={`text-xl font-bold ${isAdd ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>{title}</h3>
        <p className='text-sm dark:text-gray-300'>Ingresa la cantidad para <strong>{activeIngredient?.name}</strong>:</p>
        <input
          type="number"
          step="0.01"
          placeholder={`Cantidad (${activeIngredient?.unitOfMeasure.toUpperCase()})`}
          value={restockAmount}
          onChange={(e) => setRestockAmount(e.target.value)}
          className="w-full p-2 border rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        Cancelar
          </button>
          <button onClick={() => onConfirm(currentId, parseFloat(restockAmount))} 
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${isAdd ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            <Icon className="w-4 h-4 inline mr-1"/> {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

const StockManagementTable: React.FC<Props> = ({ setRestockId, restockId, stockIngredients, lowStockAlert,
  requestSort, getSortIcon, handleQuickRestock, handleRestockCustom,
  setRestockAmount, restockAmount, removeStockId, setRemoveStockId,
  handleRemoveStockCustom, activeIngredients, onRemoveFromStock }) => {

  const handleCloseRestockModal = () => {
    setRestockId(null)
    setRestockAmount('0')
  }

  const handleCloseRemoveModal = () => {
    setRemoveStockId(null)
    setRestockAmount('0')
  }
  
  return (
    <>
      {/* <StockAlert lowStockAlert={lowStockAlert} /> */}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                                Nombre {getSortIcon('name')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('stock')}>
                                Stock {getSortIcon('stock')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('reorderThreshold')}>
                                Umbral {getSortIcon('reorderThreshold')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gestión Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quitar de stock</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stockIngredients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300">
                  Aún no se han agregado ingredientes al stock.
                </td>
              </tr>
            ) : (
              stockIngredients.map((i) => (
                <tr key={i.id} className={(Number(i.stock) <= Number(i.reorderThreshold || 0)) ? 'bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                    {(Number(i.stock) <= Number(i.reorderThreshold || 0)) && (
                      <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 inline mr-2"/>
                    )}
                    {i.name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono text-center ${parseFloat(i.stock) < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}> 
                    {i.stock !== undefined && i.stock !== null && !isNaN(parseFloat(i.stock))
                      ? parseFloat(i.stock).toFixed(2)
                      : '0.00'} {i.unitOfMeasure?.toUpperCase?.()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    {i.reorderThreshold !== undefined && i.reorderThreshold !== null && !isNaN(parseFloat(i.reorderThreshold))
                      ? parseFloat(i.reorderThreshold).toFixed(2)
                      : '-'} {i.unitOfMeasure?.toUpperCase?.()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
                    {i.unitOfMeasure === 'g' && i.type === 'malt' && (
                      <>
                        <button onClick={() => handleQuickRestock(i.id, 1000)} className="text-green-600 dark:text-green-400 hover:text-green-800 p-1 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition text-xs">
                          +1K
                        </button>
                        <button onClick={() => handleQuickRestock(i.id, -1000)} className="text-red-600 dark:text-red-400 hover:text-red-800 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition text-xs ml-1">
                          -1K
                        </button>
                      </>
                    )}
                    {i.unitOfMeasure === 'g' && (i.type === 'hop' || i.type === 'yeast') && (
                      <>
                        <button onClick={() => handleQuickRestock(i.id, 100)} className="text-green-600 dark:text-green-400 hover:text-green-800 p-1 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition text-xs">
                          +100g
                        </button>
                        <button onClick={() => handleQuickRestock(i.id, -100)} className="text-red-600 dark:text-red-400 hover:text-red-800 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition text-xs ml-1">
                          -100g
                        </button>
                      </>
                    )}
                    {i.unitOfMeasure === 'l' && (
                      <>
                        <button onClick={() => handleQuickRestock(i.id, 5)} className="text-green-600 dark:text-green-400 hover:text-green-800 p-1 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition text-xs">
                          +5L
                        </button>
                        <button onClick={() => handleQuickRestock(i.id, -5)} className="text-red-600 dark:text-red-400 hover:text-red-800 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition text-xs ml-1">
                          -5L
                        </button>
                      </>
                    )}
                    <button onClick={() => { setRestockId(i.id); setRestockAmount('0') }} 
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition text-xs">
                      <Plus className="w-4 h-4 inline" /> Ingreso
                    </button>
                    <button onClick={() => { setRemoveStockId(i.id); setRestockAmount('0') }} 
                      className="text-red-600 dark:text-red-400 hover:text-red-800 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition text-xs">
                      <Minimize2 className="w-4 h-4 inline" /> Quitar
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => onRemoveFromStock(i.id)}
                      className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xs border border-gray-300 dark:border-gray-600">
                      Quitar de stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {restockId && (
        <StockModal 
          isAdd={true} 
          onClose={handleCloseRestockModal} 
          onConfirm={handleRestockCustom} 
          currentId={restockId} 
          restockAmount={restockAmount} 
          setRestockAmount={setRestockAmount} 
          activeIngredients={activeIngredients} 
        />
      )}
      {removeStockId && (
        <StockModal 
          isAdd={false} 
          onClose={handleCloseRemoveModal} 
          onConfirm={handleRemoveStockCustom} 
          currentId={removeStockId} 
          restockAmount={restockAmount} 
          setRestockAmount={setRestockAmount} 
          activeIngredients={activeIngredients} 
        />
      )}
    </>
  )
}

export default StockManagementTable
