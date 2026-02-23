import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import useAppStore from '../../stores/useAppStore'

type Ingredient = any

type Props = { lowStockAlert?: Ingredient[] }

const StockAlert: React.FC<Props> = ({ lowStockAlert = [] }) => {
  const alerts = lowStockAlert || []
  const { alertConfig, setAlertConfig } = useAppStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempBatch, setTempBatch] = useState(alertConfig.targetBatchLiters)
  const [tempPercentage, setTempPercentage] = useState(alertConfig.minStockPercentage)

  const handleConfigSave = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    setAlertConfig({
      targetBatchLiters: parseFloat((tempBatch as any).toString()) || 20,
      minStockPercentage: parseFloat((tempPercentage as any).toString()) || 200,
    })
    setIsExpanded(false)
  }

  if (alerts.length === 0 && !isExpanded) return null

  return (
    <div className={`border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-6 ${alerts.length > 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="font-bold">ALERTA DE STOCK ({alerts.length})</span>
          <span className="ml-4 text-sm font-medium underline">{isExpanded ? 'Ocultar' : 'Configurar/Ver'}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-3 p-2 border-t border-yellow-300 dark:border-yellow-700">
          <p className="text-xs font-semibold">Configuración Actual (Usada en alertas):</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1">Lote Objetivo (L)</label>
              <input 
                type="number" 
                name="targetBatchLiters" 
                value={tempBatch as any} 
                onChange={e => setTempBatch(parseFloat(e.target.value) || 0)}
                className="w-full p-1 border rounded text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Stock Mínimo (%)</label>
              <input 
                type="number" 
                value={tempPercentage as any} 
                onChange={e => setTempPercentage(parseFloat(e.target.value) || 0)}
                className="w-full p-1 border rounded text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <button onClick={handleConfigSave} className="w-full mt-2 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full hover:bg-indigo-600 transition shadow-md">Guardar Configuración</button>

          {alerts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-yellow-300 dark:border-yellow-700 space-y-2">
              <p className="font-bold text-sm">Ingredientes bajo el {tempPercentage}% para {tempBatch}L:</p>
              {alerts.map(i => (
                <p key={i.id} className="text-sm"><span className="font-medium">{i.name}:</span> Stock ({i.stock}{i.unitOfMeasure}) insuficiente.</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StockAlert
