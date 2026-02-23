import React, { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { ingredientService } from '../../services/logic'
import useDataStore from '../../stores/useDataStore'

type Props = { onClose: () => void }

const ApiSearchModal: React.FC<Props> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [status, setStatus] = useState<'idle'|'searching'>('idle')
  const { ingredients, setIngredients } = useDataStore()

  const apiIngredients = useMemo(() => [
    { name: 'Malta Múnich Oscura', type: 'malt', unit: 'g' },
    { name: 'Lúpulo Mosaic', type: 'hop', unit: 'g' },
    { name: 'Ácido Láctico', type: 'other', unit: 'l' },
    { name: 'Irish Moss', type: 'other', unit: 'g' },
    { name: 'Lúpulo Amarillo', type: 'hop', unit: 'g' },
  ], [])

  const searchApi = () => {
    setStatus('searching')
    setTimeout(() => {
      const query = searchTerm.toLowerCase()
      const currentNames = new Set(ingredients.filter(i => i.deletedAt === null).map(i => i.name.toLowerCase()))

      const filtered = apiIngredients
        .filter(item => item.name.toLowerCase().includes(query))
        .map(item => ({ ...item, isAdded: currentNames.has(item.name.toLowerCase()) }))
      setResults(filtered)
      setStatus('idle')
    }, 800)
  }

  const handleAdd = (name: string) => {
    try {
      const newIngredients = ingredientService.addFromApi(ingredients, name)
      setIngredients(newIngredients)
      alert(`${name} añadido al inventario.`)
      setResults(prev => prev.map(r => r.name === name ? { ...r, isAdded: true } : r))
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-xl w-full">
        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex justify-between items-center">
            Buscar Ingredientes en API
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400">
            <X className="w-5 h-5"/>
          </button>
        </h3>

        <div className="flex justify-center items-center space-x-2 mb-4 mt-8">
          <p style={{fontWeight: 'bold', width: '80%', textAlign: 'center', margin: '0'}}>Seccion en desarrollo</p>
          {/* <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          /> */}
          <button onClick={searchApi} disabled={true}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {status === 'searching' ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {results.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.type.toUpperCase()} ({item.unit.toUpperCase()})</p>
                </div>
                {item.isAdded ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">En Inventario</span>
                ) : (
                  <button onClick={() => handleAdd(item.name)}
                    className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 text-sm">Añadir</button>
                )}
              </div>
            ))}
          </div>
        )}
        {status === 'idle' && results.length === 0 && searchTerm.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No se encontraron ingredientes nuevos.</p>
        )}
      </div>
    </div>
  )
}

export default ApiSearchModal
