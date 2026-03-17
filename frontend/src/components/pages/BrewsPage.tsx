import React, { useState, useMemo } from 'react'
import { BeerGlassIcon } from '../common/Icons'
import { Utensils, XCircle, Check, Trash2, FlaskConical, CheckCircle, SortAsc, SortDesc } from 'lucide-react'
import { ActionConfirmationModal, DatePickerModal } from '../common/CommonModals'
import { brewService, ingredientService } from '../../services/logic'
import useDataStore from '../../stores/useDataStore'
import type { Brew } from '../../types'
import brewsApi from '../../services/api/brews'
import ingredientsApi from '../../services/api/ingredients'
import { toast } from 'react-toastify'
import useModalStore from '../../stores/useModalStore'

const BrewsPage: React.FC = () => {
    // Guardar notas de cocción/post cocción
    const handleSaveNotes = async () => {
      if (!infoRecipe) return;
      try {
        await brewsApi.patch(infoRecipe.brewId, { notes: infoRecipe.notesEdit ?? infoRecipe.notes ?? '' });
        setInfoRecipe({ ...infoRecipe, notes: infoRecipe.notesEdit ?? infoRecipe.notes, notesEditMode: false });
        // Refrescar brews
        const refreshedBrews = await brewsApi.getAll();
        setBrews(refreshedBrews);
        toast.success('Notas actualizadas en la cocción.');
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.message || 'Ocurrió un error al guardar las notas';
        toast.error(msg);
      }
    };
  const { brews, setBrews, setIngredients } = useDataStore()
  const { setRecipeId, setShowModal } = useModalStore()
  const [infoRecipe, setInfoRecipe] = useState<any>(null)
  const [statusMessage, setStatusMessage] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<any>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState({ key: 'brewDate', direction: 'desc' })
   const [bottlingModal, setBottlingModal] = useState<{brew: Brew, date: Date}|null>(null)

  const sortedBrews = useMemo(() => {
    const data = [...brews]
    if (!sortConfig.key) return data
    return data.sort((a: any, b: any) => {
      let aValue: any = a[sortConfig.key]
      let bValue: any = b[sortConfig.key]

      if (aValue instanceof Date) {
        aValue = aValue.getTime()
        bValue = bValue.getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [brews, sortConfig])

  const requestSort = (key: string) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
  }

  const handleCancelBrew = async (brewId: string) => {
    try {
      await brewsApi.cancel(brewId)
      toast.success('¡Cocción cancelada! El stock ha sido repuesto.')
      setConfirmAction(null)
    } catch (error: any) {
      toast.error('Ocurrio un error al cancelar la cocción')
    } finally {
      // Refrescar datos de brews e ingredientes
      try {
        const refreshedBrews = await brewsApi.getAll()
        setBrews(refreshedBrews)
        const refreshedIngredients = await ingredientsApi.getAll()
        setIngredients(refreshedIngredients)
      } catch (e) {
        toast.error('No se pudo actualizar el listado de cocciones o ingredientes')
      }
    }
  }

  const handleFinishBrew = async (brewId: string) => {
    try {
      await brewsApi.patch(brewId, { status: 'finished' })
      toast.success('Coccion finalizada exitosamente.')
      setConfirmAction(null)
      const refreshedBrews = await brewsApi.getAll()
      setBrews(refreshedBrews)
    } catch (error: any) {
      toast.error('Ocurrio un error al finalizar la cocción')
    }
  }

  const handleBottlingDateUpdate = async (brew: Brew, date: Date) => {
    try {
      await brewsApi.patch(brew.id, { bottlingDate: date })
      toast.success('Fecha de embotellado actualizada.')
      setBottlingModal(null)
      const refreshedBrews = await brewsApi.getAll()
      setBrews(refreshedBrews)
    } catch (error: any) {
      toast.error('Ocurrio un error al actualizar la fecha de embotellado')
    }
  }

  const handleDeleteBrew = async (brewId: string) => {
    try {
      await brewsApi.remove(brewId)
      toast.success('Cocción eliminada del historial.')
      setConfirmAction(null)
      // Refrescar la lista de brews
      const refreshedBrews = await brewsApi.getAll()
      setBrews(refreshedBrews)
    } catch (error: any) {
      toast.error('Ocurrió un error al eliminar la cocción')
    }
  }

  const handleBottlingClick = (brew: Brew) => {
    if (brew.status !== 'finished') return
    setBottlingModal({ brew, date: brew.bottlingDate ? new Date(brew.bottlingDate) : new Date() })
  }

  const getModalProps = () => {
    if (!confirmAction) return null
    const brew = brews.find((b: any) => b.id === confirmAction.brewId)
    if (!brew) return null
    switch (confirmAction.action) {
      case 'cancel':
        return {
          title: 'Confirmar Cancelación',
          message: `¿Estás seguro de cancelar la cocción de ${brew.recipeName}? El stock usado se repondrá.`,
          actionText: 'Cancelar Cocción',
          onConfirm: () => handleCancelBrew(brew.id),
        }
      case 'finish':
        return {
          title: 'Confirmar Finalización',
          message: `¿Deseas marcar la cocción de ${brew.recipeName} como FINALIZADA? (La fecha de embotellado se puede añadir al hacer clic en la columna).`,
          actionText: 'Finalizar Cocción',
          onConfirm: () => handleFinishBrew(brew.id),
        }
      case 'delete':
        return {
          title: 'Confirmar Eliminación',
          message: `¿Estás seguro de eliminar el registro de cocción #${brews.indexOf(brew) + 1}?`,
          actionText: 'Eliminar Registro',
          onConfirm: () => handleDeleteBrew(brew.id),
        }
      default:
        return null
    }
  }

  const modalProps = getModalProps()

  return (
    <div className="p-6 md:p-10">
      {/* Modal de info de receta */}
      {infoRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onMouseDown={e => {
            // Solo cerrar si el target es el fondo, no si es un elemento interactivo
            if (e.target === e.currentTarget) {
              setInfoRecipe(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
              <BeerGlassIcon srm={infoRecipe.colorSrm || 5} className="w-6 h-6 mr-2" />
              {infoRecipe.name || '-'}
              <button
                className="ml-4 px-3 py-1 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-base"
                onClick={() => {
                  setRecipeId(infoRecipe.recipeId || infoRecipe.id);
                  setShowModal(true);
                  setInfoRecipe(null);
                }}
              >VER RECETA</button>
            </h3>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Estilo:</strong> {infoRecipe.style?.name || '-'}<br/>
              <strong>Batch:</strong> {infoRecipe.batchLiters ? `${infoRecipe.batchLiters}L` : '-'}<br/>
              <strong>IBU:</strong> {infoRecipe.ibu ?? '-'} | <strong>Alcohol:</strong> {infoRecipe.alcoholPercent ?? '-'}% | <strong>Color SRM:</strong> {infoRecipe.colorSrm ?? '-'}<br/>
              <strong>Fecha Cocción:</strong> {infoRecipe.brewDate ? new Date(infoRecipe.brewDate).toLocaleDateString() : '-'}<br/>
              <strong>Fecha Embotellado:</strong> {infoRecipe.bottlingDate ? new Date(infoRecipe.bottlingDate).toLocaleDateString() : '-'}<br/>
              <strong>Estado:</strong> {infoRecipe.status || '-'}<br/>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Ingredientes:</strong>
              <ul className="list-disc ml-6">
                {infoRecipe.ingredients && infoRecipe.ingredients.length > 0 ? (
                  infoRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing.ingredient?.name || '-'}: {ing.quantity ?? '-'} {ing.ingredient?.unitOfMeasure || '-'}
                      {ing.time ? ` (${ing.time} ${ing.timeUnit || ''})` : ''}
                      {ing.usageMoment ? ` - ${ing.usageMoment}` : ''}
                    </li>
                  ))
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Notas de receta:</strong> {infoRecipe.details?.notes || '-'}
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              {infoRecipe.notesEditMode ? (
                <>
                  <div className="mb-1 font-semibold">Notas de cocción/post cocción:</div>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    value={infoRecipe.notesEdit ?? infoRecipe.notes ?? ''}
                    onChange={e => setInfoRecipe({ ...infoRecipe, notesEdit: e.target.value })}
                    placeholder="Agregá notas de la cocción, post cocción, etc."
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    onClick={handleSaveNotes}
                  >Guardar notas</button>
                  <button
                    className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                    onClick={() => setInfoRecipe({ ...infoRecipe, notesEditMode: false, notesEdit: undefined })}
                  >Cancelar</button>
                </>
              ) : (
                <div className="mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <div className="font-semibold mb-1">Notas de cocción/post cocción:</div>
                  <div className="whitespace-pre-line">{infoRecipe.notes && infoRecipe.notes.trim() !== '' ? infoRecipe.notes : '-'}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    onClick={() => setInfoRecipe({ ...infoRecipe, notesEditMode: true, notesEdit: infoRecipe.notes })}
                  >{infoRecipe.notes && infoRecipe.notes.trim() !== '' ? 'Editar notas' : 'Agregar notas'}</button>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setInfoRecipe(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          <Utensils className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/>
          Historial de Cocciones
        </h1>
      </div>

      {statusMessage && (
        <div className={`p-4 mb-4 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
          <p className="font-semibold">{statusMessage.message}</p>
        </div>
      )}
{brews.length === 0 ? (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 flex justify-center">
    <p className="text-gray-700 dark:text-gray-300 italic">Aun no hay cocciones registradas.</p>
  </div>
) : (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Color</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estilo</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receta</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('brewDate')}>Fecha Cocción {getSortIcon('brewDate')}</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Embotellado</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>Estado {getSortIcon('status')}</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acción</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Info</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedBrews.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <BeerGlassIcon srm={b.colorSrm || 5} className="w-6 h-6 mx-auto" />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-100">{b.recipe?.style?.name || '-'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 text-center">{b.recipe?.name || b.recipeName || '-'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{b.brewDate ? new Date(b.brewDate).toLocaleDateString() : '-'}</td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center ${b.status === 'finished' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : 'select-none'}`}
                  onClick={() => b.status === 'finished' && handleBottlingClick(b)}>
                  {b.bottlingDate ? new Date(b.bottlingDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full 
                    ${b.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                    b.status === 'finished' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {b.status === 'in_progress' && <FlaskConical className="w-3 h-3 mr-1" />}
                    {b.status === 'finished' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {b.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {b.status === 'in_progress' && (
                    <>
                      <button 
                        onClick={() => setConfirmAction({ action: 'finish', brewId: b.id })}
                        title="Finalizar Cocción"
                        className="text-green-600 dark:text-green-400 hover:text-green-800 p-1 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition">
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setConfirmAction({ action: 'cancel', brewId: b.id })}
                        title="Cancelar y Reponer Stock"
                        className="text-gray-600 dark:text-gray-400 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {(b.status === 'finished' || b.status === 'cancelled') && (
                    <button 
                      onClick={() => setConfirmAction({ action: 'delete', brewId: b.id })}
                      title="Eliminar Cocción"
                      className="text-red-600 dark:text-red-400 hover:text-red-800 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <button onClick={() => {
                    const recipeInfo = b.recipe || {};
                    setInfoRecipe({
                      ...recipeInfo,
                      brewId: b.id,
                      recipeId: recipeInfo.id,
                      ingredients: recipeInfo.ingredients || [],
                      name: recipeInfo.name || b.recipeName || '-',
                      ibu: recipeInfo.ibu ?? b.ibu ?? '-',
                      alcoholPercent: recipeInfo.alcoholPercent ?? b.alcoholPercent ?? '-',
                      colorSrm: recipeInfo.colorSrm ?? b.colorSrm ?? 5,
                      style: recipeInfo.style || b.style || {},
                      details: recipeInfo.details || b.details || {},
                      status: b.status,
                      notes: b.notes,
                      bottlingDate: b.bottlingDate,
                    });
                  }} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                    <FlaskConical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    
      {modalProps && (
        <ActionConfirmationModal
          title={modalProps.title}
          message={modalProps.message}
          actionText={modalProps.actionText}
          onConfirm={modalProps.onConfirm}
          onCancel={() => { setConfirmAction(null); setActionError(null) }}
          integrityError={actionError}
        />
      )}

      {bottlingModal && (
        <DatePickerModal
          title={`Selecciona la fecha de embotellado para ${bottlingModal.brew.recipeName}`}
          initialDate={bottlingModal.date}
          onConfirm={date => handleBottlingDateUpdate(bottlingModal.brew, date)}
          onCancel={() => setBottlingModal(null)}
        />
      )}
    </div>
  )
}

export default BrewsPage
