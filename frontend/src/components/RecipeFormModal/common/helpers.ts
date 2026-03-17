// Helpers para RecipeFormModal
export const defaultDetails = {
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

export function getDefaultRecipeName(recipes: { name: string }[]): string {
    const base = 'Nueva Receta';
    const regex = new RegExp(`^${base}(?: (\\d+))?$`, 'i');
    const nums = recipes
        .map(r => {
            const match = r.name.match(regex);
            return match ? (match[1] ? parseInt(match[1], 10) : 0) : null;
        })
        .filter(n => n !== null);
    if (nums.length === 0) return base;
    const maxNum = Math.max(...nums as number[]);
    return `${base} ${maxNum + 1}`;
}// Aquí irían helpers, validaciones, hooks, etc. para el modal de receta.

export function someHelper() {
  // ...
}
