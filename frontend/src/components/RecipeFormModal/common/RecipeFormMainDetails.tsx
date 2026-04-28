import React from 'react';
import { Beer } from 'lucide-react';
import { BeerGlassIcon } from '../../common/Icons';
import EditWarning from './EditWarning';

// todo: cheuquear que en prod este viendose el decimal de IBU.
// todo: chequear lo de /twobros, que siempre me reedirecciona a futsalforher y demas
// todo: chequear logeos. No son exitosos y me dice "bienvenido de nuevo".
// todo: chequeuar la creacion de cuentas y envio de emails.

interface RecipeFormMainDetailsProps {
  isEditing: boolean;
  isCreating: boolean;
  formData: any;
  styles: any[];
  handleMainChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleDetailsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsScaling: (v: boolean) => void;
  setNewBatchSize: (v: number) => void;
  hasRelatedBrews: boolean;
  canEditIngredients: boolean;
}

const RecipeFormMainDetails: React.FC<RecipeFormMainDetailsProps> = ({
  isEditing,
  isCreating,
  formData,
  styles,
  handleMainChange,
  handleDetailsChange,
  setIsScaling,
  setNewBatchSize,
  hasRelatedBrews,
  canEditIngredients,
}) => {
  return (
    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl space-y-4">
      <h2 className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-700 pb-2 mb-4 flex items-center justify-between">
        <span><Beer className="w-5 h-5 mr-2 inline"/> FICHA TÉCNICA</span>
      </h2>
      {/* Nombre */}
      <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
        {(isEditing || isCreating) ? (
          <input type="text" name="name" value={formData.name} onChange={handleMainChange}
            className="w-full p-1 border border-gray-300 dark:border-gray-600 text-2xl font-extrabold text-gray-800 dark:text-gray-100 text-center focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800" />
        ) : (
          <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 text-center select-none" style={{ cursor: 'default' }}>{formData.name}</p>
        )}
      </div>
      {/* Estilo */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estilo</label>
        {(isEditing || isCreating) ? (
          <select name="style" value={formData.styleId ? String(formData.styleId) : ''} onChange={handleMainChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Sin estilo</option>
            {styles.filter(s => s.deletedAt === null).map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        ) : (
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
            {formData.style?.name || 'Sin estilo'}
          </p>
        )}
      </div>
      {/* Batch Final (Litros) */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Batch Final (L)</label>
        {(isEditing || isCreating) ? (
          <input type="number" step="0.1" name="batchLiters" value={formData.batchLiters === 0 || formData.batchLiters === null ? '' : formData.batchLiters} onChange={handleMainChange}
            className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
        ) : (
          <div className="flex items-center space-x-2">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 select-none" style={{ cursor: 'default' }}>{formData.batchLiters} L</p>
          </div>
        )}
      </div>
      {/* Métricas Fijas */}
      {[
        { label: 'IBU', key: 'ibu', unit: '' },
        { label: 'Alcohol (%)', key: 'alcoholPercent', unit: '%' },
      ].map(({ label, key, unit }) => (
        <div key={key} className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
          {(isEditing || isCreating) ? (
            <input type="number" step="0.1" name={key} value={formData[key] ?? ''} onChange={handleMainChange}
              className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
          ) : (
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>{Number(formData[key] ?? 0).toFixed(key === 'alcoholPercent' ? 2 : 0)} {unit}</p>
          )}
        </div>
      ))}
      {/* OG, FG, Mash Water, Sparge Water */}
      {[
        { label: 'OG', key: 'og', unit: '', details: true },
        { label: 'FG', key: 'fg', unit: '', details: true },
        { label: 'Mash Water (L)', key: 'mashWater', unit: '', details: true },
        { label: 'Sparge Water (L)', key: 'spargeWater', unit: '', details: true },
      ].map(({ label, key, unit }) => (
        <div key={key} className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
          {(isEditing || isCreating) ? (
            <input type="number" step="any" name={key} value={formData.details?.[key] === null || formData.details?.[key] === undefined ? '' : formData.details?.[key]} onChange={handleDetailsChange}
              className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
          ) : (
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>{formData.details?.[key] ?? '—'} {unit}</p>
          )}
        </div>
      ))}
      {/* Color SRM */}
      <div className="flex justify-between items-center pt-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Color (SRM)</label>
        <div className="flex items-center space-x-2">
          <BeerGlassIcon srm={formData.colorSrm} />
          {(isEditing || isCreating) ? (
            <input type="number" step="1" name="colorSrm" value={formData.colorSrm === 0 || formData.colorSrm === null ? '' : formData.colorSrm} onChange={handleMainChange}
              className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
          ) : (
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>{formData.colorSrm} SRM</p>
          )}
        </div>
      </div>
      {/* Botón Escalar Receta */}
      {!isCreating && (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => { setIsScaling(true); setNewBatchSize(formData.batchLiters); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <span className="mr-2"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 3v3a4 4 0 0 0 4 4h3m5 5v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /></svg></span>
            Escalar Receta
          </button>
        </div>
      )}
      <EditWarning show={hasRelatedBrews && !isEditing} />
    </div>
  );
};

export default RecipeFormMainDetails;
