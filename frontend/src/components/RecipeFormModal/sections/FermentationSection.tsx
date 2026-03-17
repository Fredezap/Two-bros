import { SectionContainer } from '../../common/CommonModals';
import { Beer } from 'lucide-react';
import { Clock, Thermometer } from 'lucide-react';
import { IngredientRow } from '../ingredients';
import { IngredientAdder } from '../../common/CommonModals';

const FermentationSection = ({
  formData,
  isEditing,
  isCreating,
  canEditIngredients,
  availableIngredients,
  handleDetailsChange,
  handleIngredientChange,
  handleAddIngredient,
  handleNotesChange,
  handleRemoveIngredient,
}) => (
  <SectionContainer title="Fermentación y Otros" icon={<Beer className="w-5 h-5"/>}>
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Días</label>
          {(isEditing || isCreating) ? (
            <input type="number" step="1" name="fermentationDays" value={formData.details?.fermentationDays === null || formData.details?.fermentationDays === undefined ? '' : formData.details?.fermentationDays} onChange={handleDetailsChange}
              className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          ) : (
            <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
              {formData.details?.fermentationDays > 0 ? `${formData.details.fermentationDays} días` : 'No definido'}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <Thermometer className="w-4 h-4 mr-2 text-red-500 dark:text-red-400"/>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperatura</label>
          {(isEditing || isCreating) ? (
            <input type="number" step="1" name="fermentationTempC" value={formData.details?.fermentationTempC === null || formData.details?.fermentationTempC === undefined ? '' : formData.details?.fermentationTempC} onChange={handleDetailsChange}
              className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          ) : (
            <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
              {formData.details?.fermentationTempC > 0 ? `${formData.details.fermentationTempC} °C` : 'No definido'}
            </p>
          )}
        </div>
      </div>
    </div>
    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Levaduras (en gramos) y Otros:</p>
    {Array.isArray(formData.ingredients) && Array.isArray(availableIngredients) ? formData.ingredients
      .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'yeast' || availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'other')
      .map((ri) => {
        const realIndex = formData.ingredients.indexOf(ri);
        return (
          <IngredientRow
            key={ri.ingredientId + '-' + realIndex}
            ingredient={ri}
            index={realIndex}
            isEditing={isEditing && canEditIngredients}
            isCreating={isCreating}
            availableIngredients={availableIngredients}
            onIngredientChange={handleIngredientChange}
            handleRemoveIngredient={() => handleRemoveIngredient(realIndex)}
          />
        );
      }) : null}
    {(isEditing || isCreating) && canEditIngredients && (
      <IngredientAdder 
        availableIngredients={Array.isArray(availableIngredients) ? availableIngredients.filter(i => i.type === 'yeast' || i.type === 'other') : []}
        onAdd={(id, type) => {
          handleAddIngredient(id, type);
          setTimeout(() => {
            // newIngredientIndex se debe manejar en el padre
          }, 0);
        }}
      />
    )}
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notas y Observaciones Libres</label>
      {(isEditing || isCreating) ? (
        <textarea
          name="notes"
          value={formData.details?.notes ?? ""}
          onChange={handleNotesChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      ) : (
        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
          {formData.details?.notes || 'Sin notas'}
        </p>
      )}
    </div>
  </SectionContainer>
);

export default FermentationSection;
