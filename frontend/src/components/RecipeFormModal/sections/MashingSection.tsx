import React from 'react';
import { SectionContainer } from '../../common/CommonModals';
import { MashingVesselIcon } from '../../common/Icons';
import { Clock, Thermometer } from 'lucide-react';
import { IngredientRow } from '../ingredients';
import { IngredientAdder } from '../../common/CommonModals';

const MashingSection = ({ formData, isEditing, isCreating, canEditIngredients, availableIngredients = [], handleDetailsChange, handleIngredientChange, handleAddIngredient, newIngredientIndex, setNewIngredientIndex, handleRemoveIngredient }) => {
  return (
    <SectionContainer title="Maceración" icon={<MashingVesselIcon className="w-5 h-5"/>}>
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiempo</label>
            {(isEditing || isCreating) ? (
              <input type="number" step="5" name="mashingTimeMinutes" value={formData.details?.mashingTimeMinutes ?? ""} onChange={handleDetailsChange}
                className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            ) : (
              <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                {formData.details?.mashingTimeMinutes > 0 ? `${formData.details.mashingTimeMinutes} min` : 'No definido'}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 mr-2 text-red-500 dark:text-red-400"/>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperatura</label>
            {(isEditing || isCreating) ? (
              <input type="number" step="1" name="mashingTempC" value={formData.details?.mashingTempC ?? ""} onChange={handleDetailsChange}
                className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            ) : (
              <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                {formData.details?.mashingTempC > 0 ? `${formData.details.mashingTempC} °C` : 'No definido'}
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Ingredientes (Maltas):</p>
      {Array.isArray(formData.ingredients) && Array.isArray(availableIngredients) ? formData.ingredients
        .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'malt')
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
      <div className="mt-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">
        Total maltas: {
          Array.isArray(formData.ingredients) && Array.isArray(availableIngredients) ? formData.ingredients
            .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'malt' && availableIngredients.find(i => i.id === ri.ingredientId)?.unitOfMeasure === 'g')
            .reduce((sum, ri) => sum + Number(ri.quantity || 0), 0)
          : 0
        } g
      </div>
      {(isEditing || isCreating) && canEditIngredients && (
        <IngredientAdder 
          availableIngredients={availableIngredients.filter(i => i.type === 'malt')}
          onAdd={(id) => {
            handleAddIngredient(id, 'malt');
            setTimeout(() => {
              if (Array.isArray(formData.ingredients)) {
                typeof setNewIngredientIndex === 'function' && setNewIngredientIndex(formData.ingredients.length);
              }
            }, 0);
          }}
        />
      )}
    </SectionContainer>
  );
};

export default MashingSection;