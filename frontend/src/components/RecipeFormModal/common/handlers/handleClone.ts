import { ROUTES } from '../../../../stores/routes';
import recipesApi from '../../../../services/api/recipes';
import { toast } from 'react-toastify';

export interface HandleCloneParams {
  formData: any;
  recipes: any[];
  setRecipes: (recipes: any[]) => void;
  navigate: (route: string) => void;
  setShowModal: (show: boolean) => void;
}

const handleClone = async ({ formData, recipes, setRecipes, navigate, setShowModal }: HandleCloneParams) => {
  try {
    const baseName = `Clonación ${formData.name}`;
    let cloneName = baseName;
    const regex = new RegExp(`^${baseName}(?: (\d+))?$`);
    const nums = recipes
      .map(r => {
        const match = r.name.match(regex);
        return match ? (match[1] ? parseInt(match[1], 10) : 1) : null;
      })
      .filter(n => n !== null);
    if (nums.length > 0) {
      const maxNum = Math.max(...(nums as number[]));
      cloneName = `${baseName} ${maxNum + 1}`;
    }
    const { id, deletedAt, brews, ...payload } = {
      ...formData,
      name: cloneName,
    };
    if (payload.style && payload.style.id) {
      payload.styleId = payload.style.id;
    }
    delete payload.style;
    ['userId', 'createdAt', 'updatedAt', 'user'].forEach(k => delete payload[k]);
    // No enviar userId, el backend lo obtiene del token/cookie
    await recipesApi.create(payload);
    const allRecipes = await recipesApi.getAll();
    setRecipes && setRecipes(allRecipes);
    toast.success(`¡Receta clonada como 'Clonación ${formData.name}'!`);
    navigate(ROUTES.HOME);
    setShowModal(false);
  } catch (error: any) {
    toast.error(`Error al clonar: ${error.response?.data?.message || error.message}`);
  }
};

export default handleClone;
