import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, RotateCcw, ChevronLeft, Clock, Thermometer, Maximize2, Trash2, Edit, Save, Utensils, SquarePen, AlertTriangle, Beer } from 'lucide-react';
import { ActionConfirmationModal, SectionContainer, IngredientAdder } from './common/CommonModals';
import { BeerGlassIcon, BarleyIcon, HopFlowerIcon, MashingVesselIcon, KettleIcon } from './common/Icons';
import type { CSSProperties } from 'react';
import { recipeService, brewService } from '../services/logic';
import useDataStore from '../stores/useDataStore';
import useModalStore from '../stores/useModalStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../stores/routes';
import { toast } from 'react-toastify';
import recipesApi from '../services/api/recipes';
import brewsApi from '../services/api/brews';
import { BREW_STATUS } from '../types';
import ingredientsApi from '../services/api/ingredients';

interface RecipeFormModalProps {
    initialEditMode?: boolean;
    onClose?: () => void;
}
const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ initialEditMode, onClose }) => {
            // Handler para editar notas
            const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, details: { ...prev.details, notes: value } }));
            };

    const { showModal, setShowModal, recipeId } = useModalStore();
    const { ingredients, recipes, brews, styles, setRecipes, setBrews, setIngredients } = useDataStore();
    const navigate = useNavigate();

    const isCreating = recipeId === null;
    // Objeto por defecto para una receta vacía
    const defaultDetails = { 
        mashingTimeMinutes: null, 
        mashingTempC: null, 
        fermentationDays: null, 
        fermentationTempC: null, 
        notes: '',
        og: null, // Original Gravity
        fg: null, // Final Gravity
        mashWater: null, // Mash Water (L)
        spargeWater: null // Sparge Water (L)
    };
    // Lógica para nombre incremental
    function getDefaultRecipeName(recipes) {
        const base = 'Nueva Receta';
        const regex = new RegExp(`^${base}(?: (\d+))?$`, 'i');
        const nums = recipes
            .map(r => {
                const match = r.name.match(regex);
                return match ? (match[1] ? parseInt(match[1], 10) : 0) : null;
            })
            .filter(n => n !== null);
        if (nums.length === 0) return base;
        const maxNum = Math.max(...nums);
        return `${base} ${maxNum + 1}`;
    }
    const defaultRecipe = {
        id: '',
        name: isCreating ? getDefaultRecipeName(recipes) : 'Error',
        style: null,
        styleId: null,
        batchLiters: 20,
        ibu: null,
        alcoholPercent: null,
        colorSrm: null,
        ingredients: [],
        details: defaultDetails,
        deletedAt: null,
    };
    


    const initialRecipe = useMemo(() => {
        if (isCreating) {
            // Siempre usar un objeto base fijo para nuevas recetas
            return { ...defaultRecipe };
        } else {
            const found = recipes.find(r => r.id === recipeId);
            const toNumber = v => (v === undefined || v === null || v === '' ? 0 : Number(v));
            if (found) {
                // Buscar el objeto style si solo viene styleId
                let styleObj = found.style ?? null;
                let styleId = found.styleId ?? (found.style?.id ?? null);
                if (!styleObj && styleId && Array.isArray(styles)) {
                    styleObj = styles.find(s => String(s.id) === String(styleId)) ?? null;
                }
                return {
                    ...found,
                    style: styleObj,
                    styleId: styleId,
                    batchLiters: toNumber(found.batchLiters),
                    ibu: toNumber(found.ibu),
                    alcoholPercent: toNumber(found.alcoholPercent),
                    colorSrm: toNumber(found.colorSrm),
                    details: {
                        ...defaultDetails,
                        ...(found.details || {}),
                        mashingTempC: toNumber(found.details?.mashingTempC),
                        fermentationDays: toNumber(found.details?.fermentationDays),
                        fermentationTempC: toNumber(found.details?.fermentationTempC),
                        og: found.details?.og ?? null,
                        fg: found.details?.fg ?? null,
                        mashWater: found.details?.mashWater ?? null,
                        spargeWater: found.details?.spargeWater ?? null,
                    },
                    ingredients: Array.isArray(found.ingredients)
                        ? found.ingredients.map(ing => ({
                            ...ing,
                            quantity: toNumber(ing.quantity),
                            usageMoment: ing.usageMoment ?? null,
                            time: ing.time ?? null,
                            timeUnit: ing.timeUnit ?? null,
                        }))
                        : [],
                };
            } else if (recipes.length > 0) {
                const base = { ...recipes[0] };
                return {
                    ...base,
                    name: 'Error',
                    id: '',
                    styleId: base.styleId ?? (base.style?.id ?? null),
                    ingredients: [],
                    details: { ...defaultDetails, ...(base.details || {}) },
                };
            } else {
                return { ...defaultRecipe };
            }
        }
    }, [recipeId, recipes, isCreating, styles]);

    const [formData, setFormData] = useState<{ [key: string]: any; styleId?: string | null } | any>(initialRecipe);
    // Al crear, forzar edición de ingredientes
    // Siempre permitir edición al crear
    const [isEditing, setIsEditing] = useState(isCreating);
    const [statusMessage, setStatusMessage] = useState(null);
    const [deletingRecipe, setDeletingRecipe] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [isScaling, setIsScaling] = useState(false);
    const [newBatchSize, setNewBatchSize] = useState(initialRecipe.batchLiters);
    const [forceCook, setForceCook] = useState(false);
    const hasRelatedBrews = useMemo(() => {
        return !isCreating && brews.some(b => b.recipeId === recipeId);
    }, [brews, recipeId, isCreating]);
    const canEditIngredients = isCreating || !hasRelatedBrews;

    useEffect(() => {
        setFormData(initialRecipe);
    }, [initialRecipe]);

    useEffect(() => {
        // Si está creando, forzar edición visual y lógica
        if (isCreating) {
            setIsEditing(true);
            return;
        }
        if (typeof initialEditMode === 'boolean') {
            setIsEditing(initialEditMode);
        } else if (!isCreating && hasRelatedBrews) {
            setIsEditing(false);
        } else {
            setIsEditing(false);
        }
    }, [initialEditMode, isCreating, hasRelatedBrews]);

    // Forzar edición de ingredientes al crear
    const effectiveIsEditing = isCreating ? true : isEditing;

    const availableIngredients = useMemo(() => ingredients.filter(i => i.deletedAt === null), [ingredients]);
    const handleClose = () => {
        setDeletingRecipe(null);
        setDeleteError(null);
        setStatusMessage(null);
        if (!isCreating) setIsEditing(false);
        setIsScaling(false);
        // Al cerrar, asegurarse de que todo modal secundario esté cerrado
        if (onClose) {
            onClose();
        } else {
            setShowModal(false);
        }
    };

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [setShowModal]);

    // Al abrir el modal, resetear todos los estados secundarios
    useEffect(() => {
        if (showModal) {
            setIsEditing(false);
            setDeletingRecipe(null);
            setDeleteError(null);
            setIsScaling(false);
            setStatusMessage(null);
        }
    }, [showModal]);

    // Handlers
    const handleMainChange = useCallback((e) => {
        const { name, value, type } = e.target;
        let parsedValue = value;
        if (type === 'number') {
            if (value === '' || value === undefined) {
                parsedValue = null;
            } else {
                parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) parsedValue = null;
            }
        }
        if (name === 'style') {
            // value puede ser '' (sin estilo) o el id del estilo
            if (value === '') {
                setFormData(prev => ({
                    ...prev,
                    style: null,
                    styleId: null,
                }));
            } else {
                const selectedStyle = styles.find(s => String(s.id) === String(value));
                setFormData(prev => ({
                    ...prev,
                    style: selectedStyle ?? null,
                    styleId: selectedStyle ? String(selectedStyle.id) : null,
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
        }
    }, [styles]);

    const handleDetailsChange = useCallback((e) => {
        const { name, value, type } = e.target;
        let parsedValue = value;
        if (type === 'number') {
            if (value === '' || value === undefined) {
                parsedValue = null;
            } else {
                parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) parsedValue = null;
            }
        }
        setFormData(prev => ({ 
            ...prev,
            details: { ...prev.details, [name]: parsedValue }
        }));
    }, []);

    // Estado para mantener el índice del input recién agregado
    const [newIngredientIndex, setNewIngredientIndex] = useState(null);
    const handleIngredientChange = useCallback((index, field, value, type = 'number') => {
        setFormData(prev => {
            const newIngredients = [...prev.ingredients];
            const newIngredient = { ...newIngredients[index] };
            if (field === 'quantity') {
                // Lógica similar a handleMainChange para inputs numéricos
                let parsedValue = value;
                if (type === 'number') {
                    if (value === '' || value === undefined) {
                        parsedValue = '';
                    } else {
                        parsedValue = value.toString().replace(/^0+(?=\d)/, ''); // Quitar ceros a la izquierda
                        parsedValue = parseFloat(parsedValue);
                        if (isNaN(parsedValue)) parsedValue = '';
                    }
                }
                newIngredient.quantity = parsedValue;
            } else if (field === 'usageMoment') {
                newIngredient.usageMoment = value;
            } else if (field === 'time') {
                let parsedValue = value;
                if (type === 'number') {
                    if (value === '' || value === undefined) {
                        parsedValue = '';
                    } else {
                        parsedValue = value.toString().replace(/^0+(?=\d)/, '');
                        parsedValue = parseInt(parsedValue);
                        if (isNaN(parsedValue)) parsedValue = '';
                    }
                }
                newIngredient.time = parsedValue;
            } else if (field === 'timeUnit') {
                newIngredient.timeUnit = value;
            }
            newIngredients[index] = newIngredient;
            const updated = { ...prev, ingredients: newIngredients };
            return updated;
        });
    }, []);

    const handleAddIngredient = (ingredientId, type) => {
        const ingredient = availableIngredients.find(i => i.id === ingredientId);
        if (!ingredient) {
            setStatusMessage({ type: 'error', message: 'Error: Ingrediente no encontrado o no activo.' });
            return;
        }
        let newIngredientEntry;
        if (type === 'hop') {
            newIngredientEntry = {
                ingredientId,
                quantity: ingredient.unitOfMeasure === 'g' ? 100 : 1,
                usageMoment: 'boil',
                time: null,
                timeUnit: 'minutes',
                ingredientName: ingredient.name,
                ingredientStock: ingredient.stock,
            };
        } else {
            newIngredientEntry = {
                ingredientId,
                quantity: type === 'yeast' ? 11.5 : (ingredient.unitOfMeasure === 'g' ? 100 : 1),
                ingredientName: ingredient.name,
                ingredientStock: ingredient.stock,
            };
        }
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, newIngredientEntry] }));
        setStatusMessage({ type: 'success', message: `Ingrediente ${ingredient.name} añadido a la receta.` });
        setTimeout(() => setStatusMessage(null), 3000);
    };

        // Limpiar el índice de autoFocus después de enfocar
    useEffect(() => {
        if (newIngredientIndex !== null) {
            const timeout = setTimeout(() => setNewIngredientIndex(null), 500);
            return () => clearTimeout(timeout);
        }
    }, [newIngredientIndex]);

    const handleRemoveIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSave = async() => {
        try {
            // Solo enviar los campos válidos y styleId (nunca style) al backend
            const allowedFields = {
                name: 'string',
                batchLiters: 'number',
                ibu: 'number',
                colorSrm: 'number',
                alcoholPercent: 'number',
                details: 'object',
                ingredients: 'object',
            };
            const payload: any = {};

            Object.entries(allowedFields).forEach(([key, type]) => {
                let value = formData[key];
                if (key === 'ingredients' && Array.isArray(value)) {
                    // Limpiar ingredientes: solo enviar los campos válidos
                    payload.ingredients = value.map(ing => {
                        const base = {
                            ingredientId: ing.ingredientId,
                            quantity: ing.quantity
                        };
                        // Detectar tipo hop
                        const fullIngredient = ingredients.find(i => i.id === ing.ingredientId);
                        if (fullIngredient && fullIngredient.type === 'hop') {
                            return {
                                ...base,
                                usageMoment: ing.usageMoment ?? null,
                                time: ing.time ?? null,
                                timeUnit: ing.timeUnit ?? null
                            };
                        }
                        return base;
                    });
                    // Log de ingredientes enviados
                } else if (value !== undefined && value !== null && value !== '') {
                    if (type === 'number') {
                        const num = Number(value);
                        if (!isNaN(num)) payload[key] = num;
                    } else if (type === 'object') {
                        payload[key] = value;
                    } else {
                        payload[key] = value;
                    }
                }
            });

            // styleId: enviar siempre, aunque sea null
            if (formData.style && formData.style.id) {
                payload.styleId = formData.style.id;
            } else {
                payload.styleId = null;
            }
            // Log del payload antes de enviar
            if (isCreating) {
                await recipesApi.create(payload);
            } else {
                await recipesApi.update(formData.id, payload);
            }
            const allRecipes = await recipesApi.getAll();
            setRecipes(allRecipes);
            setIsEditing(false);
            toast.success(isCreating ? 'Receta creada con éxito!' : 'Receta actualizada con éxito!');
            handleClose();
        } catch (error) {
            toast.error(isCreating ? `Error al guardar: ${error.response?.data?.message || error.message}` :
            `Error al actualizar: ${error.response?.data?.message || error.message}`);
        }
    };

    const [showStockCheck, setShowStockCheck] = useState(false);
    const [stockCheckResult, setStockCheckResult] = useState(null);
    const [showForceWarning, setShowForceWarning] = useState(false);

    const checkStockForBrew = () => {
        const recipe = recipes.find(r => r.id === formData.id);
        if (!recipe) return null;
        const result = recipe.ingredients.map(ri => {
            const ing = ingredients.find(i => i.id === ri.ingredientId);
            const disponible = ing ? Number(ing.stock) : 0;
            const requerido = Number(ri.quantity);
            return {
                name: ing ? ing.name : ri.ingredientName || 'Desconocido',
                requerido,
                disponible,
                ok: disponible >= requerido,
                unidad: ing ? ing.unitOfMeasure : '',
            };
        });
        return result;
    };

    const handleCook = () => {
        if (isEditing) { alert("Guarda la receta antes de iniciar la cocción."); return; }
        // Mostrar cartel de stock antes de cocinar
        const stockResult = checkStockForBrew();
        setStockCheckResult(stockResult);
        setShowStockCheck(true);
        setShowForceWarning(false);
    };

    const confirmCook = async (force = false) => {
        setForceCook(force);
        setShowStockCheck(false);
        setShowForceWarning(false);
        try {
            const recipe = recipes.find(r => r.id === formData.id);
            if (!recipe) throw new Error('Receta no encontrada');
            const brewPayload = {
                recipeId: recipe.id,
                batchLiters: Number(recipe.batchLiters) || recipe.batchLiters,
                status: BREW_STATUS.IN_PROGRESS,
                brewDate: new Date().toISOString(),
                // Solo guardar nota si existe
                notes: formData.details.notes && formData.details.notes.trim() !== '' ? formData.details.notes : undefined,
                ...(force ? { force: true } : {})
            };
            await brewsApi.create(brewPayload);
            // Refrescar brews desde backend
            if (setBrews) {
                const refreshedBrews = await brewsApi.getAll();
                setBrews(refreshedBrews);
            }
            // Actualizar ingredientes (stock)
            if (setIngredients) {
                try {
                    const allIngredients = await ingredientsApi.getAll();
                    setIngredients(allIngredients);
                } catch (e) {
                }
            }
            toast.success(force
                ? `¡Cocción de ${formData.name} forzada! Stock descontado (puede haber stock negativo).`
                : `¡Cocción de ${formData.name} iniciada! Stock descontado.`);
            navigate(ROUTES.BREWS);
            setShowModal(false);
        } catch (error) {
            toast.error(`Ocurrió un error al iniciar la cocción: ${error.response?.data?.message || error.message}`);
        }
        setTimeout(() => setStatusMessage(null), 10000);
    };

    const handleForceCook = () => {
        try {
            const { newBrews, newIngredients } = brewService.createBrew(brews, recipes, ingredients, formData.id, true); 
            const safeBrews = newBrews.map(b => ({ ...b, status: b.status as 'in_progress' | 'done' | 'finished' | 'cancelled' }));
            setBrews && setBrews(safeBrews);
            setIngredients && setIngredients(newIngredients);
            setStatusMessage({ type: 'success', message: `¡Cocción forzada iniciada! El stock faltante ahora está en negativo.` });
            navigate(ROUTES.BREWS);
        } catch (error: any) {
            toast.error(`Error CRÍTICO al forzar: ${error.message}`);
        }
        setForceCook(false);
        setTimeout(() => setStatusMessage(null), 10000);
    };


    const handleStartDelete = () => {
        setDeleteError(null);
        setDeletingRecipe(formData);
    };

    const confirmDelete = async () => {
        if (deletingRecipe) {
            try {
                await recipesApi.remove(deletingRecipe.id);;
                toast.success(`Receta eliminada con éxito.`);
                handleClose();
            } catch (error) {
                toast.error('Error al eliminar la receta: ' + (error.response?.data?.message || error.message));
            } finally {
                try {
                    const allRecipes = await recipesApi.getAll();
                    setRecipes(allRecipes);
                } catch (e) {
                    toast.error('No se pudo actualizar el listado de recetas')
                }
            }
        }
    };
    
const handleScale = async () => {
    try {
        const newSize = parseFloat(newBatchSize.toString());
        if (isNaN(newSize) || newSize <= 0) { alert("Ingresa un tamaño de batch válido."); return; }
        const oldSize = formData.batchLiters;
        if (!oldSize || oldSize <= 0) { alert("Batch original inválido"); return; }
        const factor = newSize / oldSize;
        // Escalar ingredientes
        const scaledIngredients = formData.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: Math.round((ing.quantity * factor + Number.EPSILON) * 100) / 100,
            usageMoment: ing.usageMoment ?? null,
            time: ing.time ?? null,
            timeUnit: ing.timeUnit ?? null
        }));
        setIsScaling(true);
        setStatusMessage({ type: 'info', message: `Escalando ingredientes a ${newSize}L...` });
        // Log del payload enviado al escalar
        // Actualizar ingredientes y batchLiters en el backend
        await recipesApi.update(formData.id, { ingredients: scaledIngredients, batchLiters: newSize });
        setStatusMessage(null)
        // Actualizar recetas en frontend
        const allRecipes = await recipesApi.getAll();
        setRecipes && setRecipes(allRecipes);
        toast.success(`Receta escalada exsitosamente a ${newSize}L. Revisa los ingredientes antes de cocinar.`);
        setIsScaling(false);
    } catch (error) {
        setIsScaling(false);
        toast.error(`Error al guardar ingredientes escalados: ${error.response?.data?.message || error.message}`);
        setTimeout(() => setStatusMessage(null), 7000);
    }
};

    const handleClone = async () => {
        try {
            // Preparar payload para backend (sin id, deletedAt, brews, etc) con nombre único incremental
            const baseName = `Clonación ${formData.name}`;
            let cloneName = baseName;
            const regex = new RegExp(`^${baseName}(?: (\\d+))?$`);
            const nums = recipes
                .map(r => {
                    const match = r.name.match(regex);
                    return match ? (match[1] ? parseInt(match[1], 10) : 1) : null;
                })
                .filter(n => n !== null);
            if (nums.length > 0) {
                const maxNum = Math.max(...nums);
                cloneName = `${baseName} ${maxNum + 1}`;
            }
            const { id, deletedAt, brews, ...payload } = {
                ...formData,
                name: cloneName
            };
            // El backend espera styleId, no style
            if (payload.style && payload.style.id) {
                payload.styleId = payload.style.id;
            }
            delete payload.style;
            ['userId', 'createdAt', 'updatedAt', 'user'].forEach(k => delete payload[k]);
            
            // Crear en backend
            await recipesApi.create(payload);
            // Actualizar recetas desde backend
            const allRecipes = await recipesApi.getAll();
            setRecipes && setRecipes(allRecipes);
            toast.success(`¡Receta clonada como 'Clonación ${formData.name}'!`);
            navigate(ROUTES.HOME);
            setShowModal(false);
        } catch (error: any) {
            toast.error(`Error al clonar: ${error.response?.data?.message || error.message}`);
        }
    };
    
    const handleStartEdit = () => {
        if (hasRelatedBrews) {
            setStatusMessage({ type: 'error', message: 'Edición de ingredientes bloqueada por cocciones registradas. Usa el botón "Clonar y Editar" si necesitas hacer cambios.' });
        } else {
            setIsEditing(true);
        }
    };


    // Componente auxiliar para la fila de ingredientes
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
    const IngredientRow = ({ ingredient, index, isEditing, availableIngredients, onIngredientChange, autoFocus }) => {
        const fullIngredient = availableIngredients.find(i => i.id === ingredient.ingredientId);
        const nonEditableStyle: CSSProperties = { cursor: 'default', userSelect: 'none' };
        const getTypeIcon = (type) => {
            switch(type) {
                case 'malt': return <BarleyIcon className="w-4 h-4 mr-2"/>;
                case 'hop': return <HopFlowerIcon className="w-4 h-4 mr-2"/>;
                case 'yeast': return <Beer className="w-4 h-4 mr-2 text-red-600 dark:text-red-400"/>;
                default: return <Beer className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400"/>;
            }
        }
        // Refs para los inputs editables
        const cantidadRef = useRef(null);
        const tiempoRef = useRef(null);
        useEffect(() => {
            if (isEditing && autoFocus) {
                if (cantidadRef.current) {
                    cantidadRef.current.focus();
                } else if (tiempoRef.current) {
                    tiempoRef.current.focus();
                }
            }
        }, [isEditing, autoFocus]);
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
                                onChange={(e) => onIngredientChange(index, 'quantity', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                                autoFocus={autoFocus}
                            />
                        ) : (
                            <p className="text-right font-mono text-gray-800 dark:text-gray-200 select-none" style={nonEditableStyle}>{ingredient.quantity?.toFixed(2)} {fullIngredient?.unitOfMeasure?.toUpperCase()}</p>
                        )}
                    </div>
                    {/* Solo para lúpulos: momento de uso, tiempo y unidad */}
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
                                    autoFocus={autoFocus && !cantidadRef.current}
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
                            <X className="w-4 h-4 inline" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

     // Solo renderizar si el modal está abierto
    if (!showModal) return null;

    if (initialRecipe.id !== '' && !recipes.find(r => r.id === recipeId)) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50" onClick={handleClose}>
                <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full my-8" onClick={e => e.stopPropagation()}>
                    <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Receta no encontrada</h1>
                    <button onClick={handleClose} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Volver a Mis Recetas</button>
                </div>
            </div>
        );
    }
    
    const isReadyToCook = !isCreating && !isEditing;
// ...existing code...
    // En el return principal:
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto"
            onMouseDown={e => {
                // Solo cerrar si el click es en el fondo, no dentro del modal ni barra de scroll
                if (e.target === e.currentTarget) {
                    // Detectar si el click fue en la barra de scroll (lado derecho del viewport)
                    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                    const clickX = e.clientX;
                    // Si hay scroll y el click fue en la zona de la barra, no cerrar
                    if (scrollBarWidth > 0 && clickX >= window.innerWidth - scrollBarWidth) {
                        return;
                    }
                    handleClose();
                }
            }}
            role="presentation"
        >
            <div
                className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()} // click dentro NO cierra
                role="dialog"
                aria-modal="true"
            >
                
                {/* Header del Modal */}
                <header className="bg-white dark:bg-gray-800 p-6 rounded-t-xl shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="relative flex justify-center items-center">
                        
                        {/* Flecha para Atrás (Cerrar) */}
                        <button onClick={handleClose} className="absolute left-0 p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            <ChevronLeft className="w-6 h-6"/>
                                    </button>
                    </div>
                </header>

                <div className="p-6 md:p-8">
                    
                    {/* Botones de Acción */}
                    <div className="mb-8 flex flex-wrap gap-3 justify-end">

                        {!isCreating && (
                            <button onClick={handleClone} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
                                <SquarePen className="w-5 h-5 mr-2" /> CLONAR
                            </button>
                        )}
                        
                        {(isEditing || isCreating) && (
                            <button onClick={handleSave} className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md">
                                <Save className="w-5 h-5 mr-2" /> GUARDAR RECETA
                            </button>
                        )}
                        
                        {!isCreating && (
                            <button 
                                onClick={isEditing ? () => setIsEditing(false) : handleStartEdit}
                                className={`flex items-center px-4 py-2 font-semibold rounded-lg transition shadow-md 
                                    ${isEditing ? 'bg-gray-400 text-gray-800 hover:bg-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                {isEditing ? (
                                    <><X className="w-5 h-5 mr-2" /> Cancelar Edición</>
                                ) : (
                                    <><Edit className="w-5 h-5 mr-2" /> Editar</>
                                )}
                            </button>
                        )}

                        {isReadyToCook && (
                             <button onClick={handleCook} className="flex items-center px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition shadow-md">
                                <Utensils className="w-5 h-5 mr-2" /> COCINAR (Iniciar Brew)
                            </button>
                        )}
                        
                        {!isCreating && (
                            <button onClick={handleStartDelete} className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md">
                                <Trash2 className="w-5 h-5 mr-2" /> ELIMINAR
                            </button>
                        )}
                    </div>
                    {statusMessage && (
                        <div className={`m-4 p-3 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : (statusMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}`}>
                            {statusMessage.message}
                        </div>
                    )}
                    {showStockCheck && stockCheckResult && (
                        <div className="m-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg relative">
                            <button onClick={() => setShowStockCheck(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">×</button>
                            <h3 className="text-lg font-bold mb-2">Estado de Stock para esta Cocción</h3>
                            <ul className="space-y-2">
                                {stockCheckResult.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        {item.ok ? (
                                            <span className="text-green-600">✔️</span>
                                        ) : (
                                            <span className="text-red-600">❌</span>
                                        )}
                                        <span className="font-semibold">{item.name}</span>:
                                        <span>{item.requerido} {item.unidad} necesarios</span>
                                        <span className="mx-2">|</span>
                                        <span className={item.ok ? 'text-green-700' : 'text-red-700'}>
                                            {item.disponible} {item.unidad} en stock
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {stockCheckResult.some(item => !item.ok) && !showForceWarning && (
                                <div className="flex justify-end mt-4 gap-2">
                                    <button onClick={() => setShowStockCheck(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
                                    <button onClick={() => setShowForceWarning(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">Forzar Cocción</button>
                                </div>
                            )}
                            {stockCheckResult.every(item => item.ok) && (
                                <div className="flex justify-end mt-4 gap-2">
                                    <button onClick={() => setShowStockCheck(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
                                    <button onClick={() => confirmCook(false)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition">Confirmar Cocción</button>
                                </div>
                            )}
                            {showForceWarning && (
                                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                                    <p className="font-bold mb-2">¡Atención!</p>
                                    <p>El stock de los ingredientes insuficientes quedará en negativo si continúas.</p>
                                    <ul className="mt-2 mb-2 list-disc list-inside">
                                        {stockCheckResult.filter(item => !item.ok).map((item, idx) => (
                                            <li key={idx}>{item.name}: faltan {item.requerido - item.disponible} {item.unidad}</li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setShowForceWarning(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
                                        <button onClick={() => confirmCook(true)} className="px-4 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition">Confirmar y Forzar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                
                    {/* Contenido Principal de Receta */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* COLUMNA 1: Métricas y Detalles Principales */}
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl space-y-4">
                            <h2 className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-700 pb-2 mb-4 flex items-center justify-between">
                                <span><Beer className="w-5 h-5 mr-2 inline"/> FICHA TÉCNICA</span>
                            </h2>
                            
                            {/* Nombre (Estilo Mejorado) */}
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
                                        {(() => {
                                            return formData.style?.name || 'Sin estilo';
                                        })()}
                                    </p>
                                )}
                            </div>

                            {/* 4. Métrica: Batch Final (Litros) - Solo input */}
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
                                        <input type="number" step="any" name={key} value={formData.details?.[key] ?? ''} onChange={e => setFormData((prev: any) => ({ ...prev, details: { ...prev.details, [key]: e.target.value === '' ? null : Number(e.target.value) } }))}
                                            className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
                                    ) : (
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>{formData.details?.[key] ?? '—'} {unit}</p>
                                    )}
                                </div>
                            ))}
                            
                            {/* Color SRM - Icono y Valor */}
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

                            {/* Botón Escalar Receta: siempre disponible si no es creación */}
                            {!isCreating && (
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => { setIsScaling(true); setNewBatchSize(formData.batchLiters); }}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
                                    >
                                        <Maximize2 className="w-5 h-5 mr-2" /> Escalar Receta
                                    </button>
                                </div>
                            )}
                            
                            {/* Icono de advertencia de edición */}
                            {hasRelatedBrews && !isEditing && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2"/> Edición de ingredientes bloqueada.
                                </div>
                            )}

                        </div>

                        {/* COLUMNA 2 Y 3: Ingredientes y Detalles */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* SECCIÓN MACERACIÓN (Maltas) */}
                            <SectionContainer title="Maceración" icon={<MashingVesselIcon className="w-5 h-5"/>}>
                                {/* Tiempos y Temperaturas de Maceración */}
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiempo</label>
                                            {(isEditing || isCreating) ? (
                                                <input type="number" step="5" name="mashingTimeMinutes" value={formData.details.mashingTimeMinutes} onChange={handleDetailsChange}
                                                    className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                            ) : (
                                                <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                                                    {formData.details.mashingTimeMinutes > 0 ? `${formData.details.mashingTimeMinutes} min` : 'No definido'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <Thermometer className="w-4 h-4 mr-2 text-red-500 dark:text-red-400"/>
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperatura</label>
                                            {(isEditing || isCreating) ? (
                                                <input type="number" step="1" name="mashingTempC" value={formData.details.mashingTempC} onChange={handleDetailsChange}
                                                    className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                            ) : (
                                                <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                                                    {formData.details.mashingTempC > 0 ? `${formData.details.mashingTempC} °C` : 'No definido'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Ingredientes (Maltas):</p>
                                {formData.ingredients
                                    .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'malt')
                                    .map((ri, index) => (
                                        <IngredientRow 
                                            key={ri.ingredientId + index} 
                                            ingredient={ri} 
                                            index={formData.ingredients.indexOf(ri)}
                                            isEditing={effectiveIsEditing && canEditIngredients}
                                            availableIngredients={availableIngredients}
                                            onIngredientChange={handleIngredientChange}
                                            autoFocus={newIngredientIndex === formData.ingredients.indexOf(ri)}
                                        />
                                    ))}
                                {(isEditing || isCreating) && canEditIngredients && (
                                    <IngredientAdder 
                                        availableIngredients={availableIngredients.filter(i => i.type === 'malt')}
                                        onAdd={(id) => {
                                            handleAddIngredient(id, 'malt');
                                            // El nuevo ingrediente siempre se agrega al final
                                            setTimeout(() => {
                                                setNewIngredientIndex(formData.ingredients.length);
                                            }, 0);
                                        }}
                                    />
                                )}
                            </SectionContainer>
                            
                            {/* SECCIÓN COCCIÓN (Lúpulos) */}
                            <SectionContainer title="Cocción / Lúpulos" icon={<KettleIcon className="w-5 h-5"/>}>
                                {/* Tiempo general de cocción */}
                                <div className="flex items-center mb-2">
                                    <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiempo de Cocción (min)</label>
                                    {(isEditing || isCreating) ? (
                                        <input type="number" step="5" name="boilTimeMinutes" value={formData.details.boilTimeMinutes || ''} onChange={handleDetailsChange}
                                            className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                    ) : (
                                        <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                                            {formData.details.boilTimeMinutes > 0 ? `${formData.details.boilTimeMinutes} min` : 'No definido'}
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Momento clave: Boil (60/90min), HopStand/Whirlpool (temp/tiempo), DryHop (días).</p>
                                {formData.ingredients
                                    .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'hop')
                                    .map((ri, index) => (
                                        <IngredientRow 
                                            key={ri.ingredientId + index} 
                                            ingredient={ri} 
                                            index={formData.ingredients.indexOf(ri)} 
                                            isEditing={effectiveIsEditing && canEditIngredients} 
                                            availableIngredients={availableIngredients}
                                            onIngredientChange={handleIngredientChange}
                                            autoFocus={newIngredientIndex === formData.ingredients.indexOf(ri)}
                                        />
                                    ))}
                                {(isEditing || isCreating) && canEditIngredients && (
                                    <IngredientAdder 
                                        availableIngredients={availableIngredients.filter(i => i.type === 'hop')}
                                        onAdd={(id) => {
                                            handleAddIngredient(id, 'hop');
                                            setTimeout(() => {
                                                setNewIngredientIndex(formData.ingredients.length);
                                            }, 0);
                                        }}
                                    />
                                )}
                            </SectionContainer>

                            {/* SECCIÓN OTROS / FERMENTACIÓN */}
                            <SectionContainer title="Fermentación y Otros" icon={<Beer className="w-5 h-5"/>}>
                                {/* Tiempos y Temperaturas de Fermentación */}
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/>
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Días</label>
                                            {(isEditing || isCreating) ? (
                                                <input type="number" step="1" name="fermentationDays" value={formData.details.fermentationDays} onChange={handleDetailsChange}
                                                    className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                            ) : (
                                                <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                                                    {formData.details.fermentationDays > 0 ? `${formData.details.fermentationDays} días` : 'No definido'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <Thermometer className="w-4 h-4 mr-2 text-red-500 dark:text-red-400"/>
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperatura</label>
                                            {(isEditing || isCreating) ? (
                                                <input type="number" step="1" name="fermentationTempC" value={formData.details.fermentationTempC} onChange={handleDetailsChange}
                                                    className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded ml-2 text-right text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                            ) : (
                                                <p className="ml-2 font-bold text-gray-800 dark:text-gray-200 select-none" style={{ cursor: 'default' }}>
                                                    {formData.details.fermentationTempC > 0 ? `${formData.details.fermentationTempC} °C` : 'No definido'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Levaduras (en gramos) y Otros:</p>
                                {formData.ingredients
                                    .filter(ri => availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'yeast' || availableIngredients.find(i => i.id === ri.ingredientId)?.type === 'other')
                                    .map((ri, index) => (
                                        <IngredientRow 
                                            key={ri.ingredientId + index} 
                                            ingredient={ri} 
                                            index={formData.ingredients.indexOf(ri)} 
                                            isEditing={effectiveIsEditing && canEditIngredients} 
                                            availableIngredients={availableIngredients}
                                            onIngredientChange={handleIngredientChange}
                                            autoFocus={newIngredientIndex === formData.ingredients.indexOf(ri)}
                                        />
                                    ))}
                                 {(isEditing || isCreating) && canEditIngredients && (
                                    <IngredientAdder 
                                        availableIngredients={availableIngredients.filter(i => i.type === 'yeast' || i.type === 'other')}
                                        onAdd={(id, type) => {
                                            handleAddIngredient(id, type);
                                            setTimeout(() => {
                                                setNewIngredientIndex(formData.ingredients.length);
                                            }, 0);
                                        }}
                                    />
                                )}
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notas y Observaciones Libres</label>
                                    {(isEditing || isCreating) ? (
                                        <textarea
                                            name="notes"
                                            value={formData.details.notes}
                                            onChange={handleNotesChange}
                                            rows={4}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg italic text-gray-600 dark:text-gray-400 select-none" style={{ cursor: 'default' }}>
                                            {formData.details.notes || "No hay notas registradas para esta receta."}
                                        </div>
                                    )}
                                </div>
                            </SectionContainer>

                        </div>
                    </div>
                </div>

                {/* Modal de Escalar Receta (dentro del contexto del Modal principal) */}
                {isScaling && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                                <Maximize2 className="w-6 h-6 mr-2"/> Escalar Receta
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">El batch actual es de <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.batchLiters} L</span>.</p>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nuevo Tamaño de Batch (Litros)</label>
                            <input
                                type="number"
                                step="1"
                                value={newBatchSize ?? ''}
                                onChange={e => setNewBatchSize(e.target.value === '' ? null : parseFloat(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-lg text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="flex justify-end space-x-3 pt-2">
                                <button onClick={() => setIsScaling(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                    Cancelar
                                </button>
                                <button onClick={handleScale} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">
                                    <RotateCcw className="w-4 h-4 mr-2 inline"/> Escalar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmación de Eliminación */}
                {deletingRecipe && (
                    <ActionConfirmationModal
                        title="Confirmar Eliminación"
                        message={`¿Estás seguro de que quieres eliminar la receta ${deletingRecipe.name}? Esta acción no se puede deshacer.`}
                        actionText="Eliminar Receta"
                        onConfirm={confirmDelete}
                        onCancel={() => setDeletingRecipe(null)}
                        integrityError={deleteError}
                    />
                )}
            </div>
        </div>
    );
};

export default RecipeFormModal