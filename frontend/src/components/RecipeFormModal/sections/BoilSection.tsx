import { SectionContainer } from '../../common/CommonModals';
import { KettleIcon } from '../../common/Icons';
import { Clock } from 'lucide-react';
import { IngredientRow } from '../ingredients';
import { IngredientAdder } from '../../common/CommonModals';

const BoilSection = ({ formData, isEditing, isCreating, canEditIngredients, availableIngredients, handleDetailsChange, handleIngredientChange, handleAddIngredient, newIngredientIndex, setNewIngredientIndex, handleRemoveIngredient }) => (
  <SectionContainer title="Cocción / Lúpulos" icon={<KettleIcon className="w-5 h-5"/>}>
    <div className="flex items-center mb-2">
      <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiempo de Cocción (min)</label>
      {(isEditing || isCreating) ? (
          <input type="number" step="5" name="boilTimeMinutes" value={formData.details?.boilTimeMinutes ?? ""} onChange={handleDetailsChange}
            className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
        ) : (
          <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
            {formData.details?.boilTimeMinutes > 0 ? `${formData.details.boilTimeMinutes} min` : 'No definido'}
          </p>
        )}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Momento clave: Boil (60/90min), HopStand/Whirlpool (temp/tiempo), DryHop (días).</p>
    {Array.isArray(formData.ingredients) && Array.isArray(availableIngredients) ? formData.ingredients
      .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'hop')
      .map((ri) => (
        <IngredientRow
          key={ri.ingredientId + '-' + formData.ingredients.indexOf(ri)}
          ingredient={ri}
          index={formData.ingredients.indexOf(ri)}
          isEditing={isEditing && canEditIngredients}
          isCreating={isCreating}
          availableIngredients={availableIngredients}
          onIngredientChange={handleIngredientChange}
          handleRemoveIngredient={() => handleRemoveIngredient(formData.ingredients.indexOf(ri))}
        />
      )) : null}
    <div className="mt-2 text-sm font-bold text-green-700 dark:text-green-300">
      Total lúpulo: {
        Array.isArray(formData.ingredients) && Array.isArray(availableIngredients) ? formData.ingredients
          .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'hop' && availableIngredients.find(i => i.id === ri.ingredientId)?.unitOfMeasure === 'g')
          .reduce((sum, ri) => sum + Number(ri.quantity || 0), 0)
        : 0
      } g
    </div>
    {(isEditing || isCreating) && canEditIngredients && (
      <IngredientAdder 
        availableIngredients={Array.isArray(availableIngredients) ? availableIngredients.filter(i => i.type === 'hop') : []}
        onAdd={(id) => {
          handleAddIngredient(id, 'hop');
          setTimeout(() => {
            if (Array.isArray(formData.ingredients) && typeof setNewIngredientIndex === 'function') {
              setNewIngredientIndex(formData.ingredients.length);
            }
          }, 0);
        }}
      />
    )}
  </SectionContainer>
);

export default BoilSection;
