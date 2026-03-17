import React from 'react';
import type { CSSProperties } from 'react';
import { BarleyIcon, HopFlowerIcon } from '../../common/Icons';
import { Beer } from 'lucide-react';

const USAGE_MOMENT_OPTIONS = [
    { value: 'boil', label: 'Boil' },
    { value: 'mash', label: 'Mash' },
    { value: 'hopstand', label: 'Hopstand' },
    { value: 'whirlpool', label: 'Whirlpool' },
    { value: 'dry_hop', label: 'Dry Hop' },
];
const TIME_UNIT_OPTIONS = [
    { value: 'minutes', label: 'Minutos' },
    { value: 'days', label: 'Días' },
];

const IngredientRow = ({ ingredient, index, isEditing, availableIngredients, onIngredientChange, handleRemoveIngredient, isCreating }) => {
    const fullIngredient = availableIngredients.find(i => i.id === ingredient.ingredientId);
    const nonEditableStyle: CSSProperties = { cursor: 'default', userSelect: 'none' };
    const getTypeIcon = (type) => {
        switch(type) {
            case 'malt': return <BarleyIcon className="w-4 h-4 mr-2"/>;
            case 'hop': return <HopFlowerIcon className="w-4 h-4 mr-2"/>;
            case 'yeast': return <Beer className="w-4 h-4 mr-2 text-red-600 dark:text-red-400"/>;
            default: return <Beer className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400"/>;
        }
    };
    const cantidadRef = React.useRef(null);
    const tiempoRef = React.useRef(null);

    return (
        <div className="flex items-center border-b border-gray-100 dark:border-gray-700 p-2">
            <div className="flex w-[95%] justify-around items-center gap-3">
                <div className="w-full h-10 flex items-center font-semibold text-gray-800 dark:text-gray-200" style={nonEditableStyle}>
                    {fullIngredient ? (
                        <>
                            {getTypeIcon(fullIngredient.type)}
                            {fullIngredient.name}
                        </>
                    ) : 'Ingrediente no encontrado'}
                </div>
                <div className="w-full h-10 flex items-center">
                    <span className="text-sm text-gray-500 block md:hidden">Cantidad:</span>
                    {isEditing ? (
                        <input
                            ref={cantidadRef}
                            type="number"
                            step="0.01"
                            value={ingredient.quantity === null || ingredient.quantity === undefined ? '' : ingredient.quantity}
                            onChange={e => onIngredientChange(index, 'quantity', e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    ) : (
                        <p className="text-right font-mono text-gray-800 dark:text-gray-200 select-none" style={nonEditableStyle}>{ingredient.quantity?.toFixed(2)} {fullIngredient?.unitOfMeasure?.toUpperCase()}</p>
                    )}
                </div>
                {fullIngredient?.type === 'hop' && (
                    <>
                    <div className="w-full h-10 flex items-center">
                        <span className="text-sm text-gray-500 block md:hidden">Uso:</span>
                        {isEditing ? (
                            <select
                                value={ingredient.usageMoment || 'boil'}
                                onChange={e => onIngredientChange(index, 'usageMoment', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {USAGE_MOMENT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-600 italic dark:text-gray-400 select-none" style={nonEditableStyle}>{USAGE_MOMENT_OPTIONS.find(opt => opt.value === ingredient.usageMoment)?.label || ingredient.usageMoment}</p>
                        )}
                    </div>
                    <div className="w-full h-10 flex items-center">
                        <span className="text-sm text-gray-500 block md:hidden">Tiempo:</span>
                        {isEditing ? (
                            <input
                                ref={tiempoRef}
                                type="number"
                                min="0"
                                value={ingredient.time ?? ''}
                                onChange={e => onIngredientChange(index, 'time', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Tiempo"
                            />
                        ) : (
                            <span className="text-sm text-gray-800 dark:text-gray-200 select-none" style={nonEditableStyle}>
                                {ingredient.time ? `${ingredient.time}` : '-'}
                            </span>
                        )}
                    </div>
                    <div className="w-full h-10 flex items-center">
                        <span className="text-sm text-gray-500 block md:hidden">Unidad:</span>
                        {isEditing ? (
                            <select
                                value={ingredient.timeUnit || 'minutes'}
                                onChange={e => onIngredientChange(index, 'timeUnit', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {TIME_UNIT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-sm text-gray-800 dark:text-gray-200 select-none" style={nonEditableStyle}>
                                {ingredient.time ? `${TIME_UNIT_OPTIONS.find(opt => opt.value === ingredient.timeUnit)?.label || ''}` : ''}
                            </span>
                        )}
                    </div>
                    </>
                )}
            </div>
            <div className="flex w-[5%] h-10 items-center justify-end">
                {(isEditing || isCreating) && (
                    <button onClick={() => handleRemoveIngredient(index)} className="w-full text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition flex items-center justify-center">
                        <Beer className="w-4 h-4 inline" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default IngredientRow;
