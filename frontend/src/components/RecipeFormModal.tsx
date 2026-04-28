import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { defaultDetails, getDefaultRecipeName } from './RecipeFormModal/common/helpers';
import { brewService } from '../services/logic';
import useDataStore from '../stores/useDataStore';
import useModalStore from '../stores/useModalStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../stores/routes';
import { toast } from 'react-toastify';
import recipesApi from '../services/api/recipes';
import brewsApi from '../services/api/brews';
import { BREW_STATUS } from '../types';
import ingredientsApi from '../services/api/ingredients';
import NotFoundModal from './RecipeFormModal/common/NotFoundModal';
import RecipeFormHeader from './RecipeFormModal/common/RecipeFormHeader';
import RecipeFormMainDetails from './RecipeFormModal/common/RecipeFormMainDetails';
import RecipeFormSections from './RecipeFormModal/common/RecipeFormSections';
import DeleteConfirmationModal from './RecipeFormModal/common/DeleteConfirmationModal';
import ScaleRecipeModal from './RecipeFormModal/common/ScaleRecipeModal';
import handleClone from './RecipeFormModal/common/handlers/handleClone';
import { useUserStore } from '../stores/useUserStore';

interface RecipeFormModalProps {
    initialEditMode?: boolean;
    onClose?: () => void;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ initialEditMode, onClose }) => {
    // Ref para guardar la receta original al abrir el modal
    const originalRecipeRef = useRef<any>(null);
    // Handler para editar notas
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, details: { ...prev.details, notes: value } }));
    };

    const { showModal, setShowModal, recipeId } = useModalStore();
    let user = useUserStore(state => state.user);
    if (!user) {
        try {
            const stored = localStorage.getItem('user-storage');
            if (stored) {
                const parsed = JSON.parse(stored);
                user = parsed.state?.user || null;
            }
        } catch (e) {
            user = null;
        }
    }
    const { ingredients, recipes, brews, styles, setRecipes, setBrews, setIngredients } = useDataStore();
    const navigate = useNavigate();

    const isCreating = recipeId === null;
    const defaultRecipe = {
        id: '',
        name: isCreating ? getDefaultRecipeName(recipes) : 'Error',
        style: null,
        styleId: null,
        batchLiters: 20,
        ibu: null,
        alcoholPercent: null,
        colorSrm: null,
        details: defaultDetails,
        deletedAt: null,
    };
    


    const initialRecipe = useMemo(() => {
        const deepClone = obj => JSON.parse(JSON.stringify(obj));
        if (isCreating) {
            // Siempre usar un objeto base fijo para nuevas recetas
            return deepClone(defaultRecipe);
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
                const recipeCopy = {
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
                return deepClone(recipeCopy);
            } else if (recipes.length > 0) {
                const base = { ...recipes[0] };
                return deepClone({
                    ...base,
                    name: 'Error',
                    id: '',
                    styleId: base.styleId ?? (base.style?.id ?? null),
                    ingredients: [],
                    details: { ...defaultDetails, ...(base.details || {}) },
                });
            } else {
                return deepClone(defaultRecipe);
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
        // Guardar copia original al abrir el modal
        originalRecipeRef.current = initialRecipe;
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

    const availableIngredients = useMemo(() => Array.isArray(ingredients) ? ingredients.filter(i => i.deletedAt === null) : [], [ingredients]);
    const handleClose = () => {
        setDeletingRecipe(null);
        setDeleteError(null);
        setStatusMessage(null);
        // Restaurar datos originales si se cierra sin guardar
        setFormData(originalRecipeRef.current);
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
            const newIngredients = prev.ingredients.map((ing, i) => {
                if (i !== index) return ing;
                let updated = { ...ing };
                if (field === 'quantity') {
                    let parsedValue = value;
                    if (type === 'number') {
                        if (value === '' || value === undefined) {
                            parsedValue = '';
                        } else {
                            parsedValue = value.toString().replace(/^0+(?=\d)/, '');
                            parsedValue = parseFloat(parsedValue);
                            if (isNaN(parsedValue)) parsedValue = '';
                        }
                    }
                    updated.quantity = parsedValue;
                } else if (field === 'usageMoment') {
                    updated.usageMoment = value;
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
                    updated.time = parsedValue;
                } else if (field === 'timeUnit') {
                    updated.timeUnit = value;
                }
                return updated;
            });
            return { ...prev, ingredients: newIngredients };
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
        setFormData(prev => ({
            ...prev,
            ingredients: Array.isArray(prev.ingredients) ? [...prev.ingredients, newIngredientEntry] : [newIngredientEntry]
        }));
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

    const handleRemoveIngredient = (ingredientIndex) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== ingredientIndex)
        }));
    };

    const handleSave = async() => {
        try {
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
                if (user) {
                    payload.userId = user.id;
                }
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
                ...(force ? { force: true } : {}),
                userId: user?.id ?? null
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

    const handleCloneWrapper = () => handleClone({
        formData,
        recipes,
        setRecipes,
        navigate,
        setShowModal
    });

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
    // ...IngredientRow ahora está modularizado...

     // Solo renderizar si el modal está abierto
    if (!showModal) return null;

    if (initialRecipe.id !== '' && !recipes.find(r => r.id === recipeId)) {
        return (
            <NotFoundModal show={true} onClose={handleClose} />
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
                <RecipeFormHeader
                    onClose={handleClose}
                    isCreating={isCreating}
                    isEditing={isEditing}
                    isReadyToCook={isReadyToCook}
                    onClone={handleCloneWrapper}
                    onSave={handleSave}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={() => setIsEditing(false)}
                    onCook={handleCook}
                    onDelete={handleStartDelete}
                    statusMessage={statusMessage}
                    showStockCheck={showStockCheck}
                    stockCheckResult={stockCheckResult}
                    showForceWarning={showForceWarning}
                    setShowStockCheck={setShowStockCheck}
                    setShowForceWarning={setShowForceWarning}
                    confirmCook={confirmCook}
                />
                
                {/* Contenido Principal de Receta */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <RecipeFormMainDetails
                        isEditing={effectiveIsEditing}
                        isCreating={isCreating}
                        formData={formData}
                        styles={styles}
                        handleMainChange={handleMainChange}
                        handleDetailsChange={handleDetailsChange}
                        setIsScaling={setIsScaling}
                        setNewBatchSize={setNewBatchSize}
                        hasRelatedBrews={hasRelatedBrews}
                        canEditIngredients={canEditIngredients}
                    />
                    <RecipeFormSections
                        formData={formData}
                        isEditing={effectiveIsEditing}
                        isCreating={isCreating}
                        canEditIngredients={canEditIngredients}
                        availableIngredients={availableIngredients}
                        handleDetailsChange={handleDetailsChange}
                        handleIngredientChange={handleIngredientChange}
                        handleAddIngredient={handleAddIngredient}
                        newIngredientIndex={newIngredientIndex}
                        setNewIngredientIndex={setNewIngredientIndex}
                        handleNotesChange={handleNotesChange}
                        handleRemoveIngredient={handleRemoveIngredient}
                    />
                </div>

                {/* Modal de Escalar Receta */}
                {isScaling && (
                    <ScaleRecipeModal
                        isOpen={isScaling}
                        batchLiters={formData.batchLiters}
                        newBatchSize={newBatchSize}
                        setNewBatchSize={setNewBatchSize}
                        onCancel={() => setIsScaling(false)}
                        onScale={handleScale}
                    />
                )}

                {/* Modal de Confirmación de Eliminación */}
                <DeleteConfirmationModal
                    deletingRecipe={deletingRecipe}
                    confirmDelete={confirmDelete}
                    setDeletingRecipe={setDeletingRecipe}
                    deleteError={deleteError}
                />
            </div>
        </div>
    );
};

export default RecipeFormModal